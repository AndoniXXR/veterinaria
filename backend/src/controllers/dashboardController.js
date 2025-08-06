const { prisma } = require('../config/database');

// Obtener estadísticas principales del dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Obtener total de usuarios por rol
    const [totalUsers, totalVets, totalClients] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'VETERINARIAN' } }),
      prisma.user.count({ where: { role: 'USER' } })
    ]);

    // Obtener ventas del mes actual
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);
    
    // Mes anterior para comparación
    const startOfLastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const endOfLastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0, 23, 59, 59);

    const [currentMonthSales, lastMonthSales] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startOfMonth, lte: endOfMonth }
        },
        _sum: { total: true },
        _count: { id: true }
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
        },
        _sum: { total: true }
      })
    ]);

    // Calcular cambio porcentual de ventas
    const salesChange = lastMonthSales._sum.total > 0 
      ? ((currentMonthSales._sum.total - lastMonthSales._sum.total) / lastMonthSales._sum.total) * 100
      : 0;

    // Obtener productos activos
    const [activeProducts, newProductsThisWeek] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({
        where: {
          isActive: true,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    // Obtener órdenes pendientes
    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' }
    });

    // Obtener nuevos usuarios esta semana
    const newUsersThisWeek = await prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    // Calcular cambio porcentual de usuarios (comparar con semana pasada)
    const usersLastWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const usersChange = usersLastWeek > 0 
      ? ((newUsersThisWeek / usersLastWeek) * 100) - 100
      : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          change: usersChange,
          veterinarians: totalVets,
          clients: totalClients,
          newThisWeek: newUsersThisWeek
        },
        sales: {
          currentMonth: currentMonthSales._sum.total || 0,
          change: salesChange,
          ordersCount: currentMonthSales._count.id || 0
        },
        products: {
          active: activeProducts,
          newThisWeek: newProductsThisWeek
        },
        orders: {
          pending: pendingOrders
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching dashboard statistics'
      }
    });
  }
};

// Obtener actividad reciente
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Obtener las últimas órdenes, usuarios y productos como actividad
    const [recentOrders, recentUsers, recentProducts, lowStockProducts] = await Promise.all([
      // Últimas órdenes procesadas
      prisma.order.findMany({
        take: 3,
        orderBy: { updatedAt: 'desc' },
        where: { status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] } },
        select: {
          id: true,
          status: true,
          total: true,
          updatedAt: true,
          user: {
            select: { name: true }
          }
        }
      }),

      // Nuevos usuarios registrados
      prisma.user.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        where: { role: 'USER' },
        select: {
          id: true,
          name: true,
          createdAt: true
        }
      }),

      // Productos recién agregados
      prisma.product.findMany({
        take: 2,
        orderBy: { createdAt: 'desc' },
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          createdAt: true
        }
      }),

      // Productos con stock bajo
      prisma.product.findMany({
        take: 3,
        where: {
          isActive: true,
          stock: { lte: 5 }
        },
        select: {
          id: true,
          name: true,
          stock: true
        }
      })
    ]);

    // Formatear actividades en orden cronológico
    const activities = [];

    // Agregar nuevos usuarios
    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registered',
        title: `Nuevo usuario registrado: ${user.name}`,
        timestamp: user.createdAt,
        color: 'blue'
      });
    });

    // Agregar órdenes procesadas
    recentOrders.forEach(order => {
      let statusText = 'procesada';
      let color = 'green';
      
      if (order.status === 'SHIPPED') {
        statusText = 'enviada';
        color = 'purple';
      } else if (order.status === 'DELIVERED') {
        statusText = 'entregada';
        color = 'green';
      }

      activities.push({
        type: 'order_processed',
        title: `Orden #${order.id} ${statusText} exitosamente`,
        timestamp: order.updatedAt,
        color: color,
        meta: {
          customer: order.user?.name,
          total: order.total
        }
      });
    });

    // Agregar productos con stock bajo
    lowStockProducts.forEach(product => {
      activities.push({
        type: 'low_stock',
        title: `Producto "${product.name}" con stock bajo (${product.stock} restantes)`,
        timestamp: new Date(), // Usar timestamp actual para alertas
        color: 'orange'
      });
    });

    // Agregar nuevos productos
    recentProducts.forEach(product => {
      activities.push({
        type: 'product_added',
        title: `Nuevo producto agregado: "${product.name}"`,
        timestamp: product.createdAt,
        color: 'purple'
      });
    });

    // Ordenar por timestamp más reciente y limitar
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: sortedActivities
    });

  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching recent activity'
      }
    });
  }
};

// Obtener conteos para admin actions
const getAdminActionCounts = async (req, res) => {
  try {
    const [usersCount, productsCount, pendingOrdersCount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      success: true,
      data: {
        users: `${usersCount} total`,
        products: `${productsCount} productos`,
        orders: `${pendingOrdersCount} pendientes`,
        reports: 'Ver más',
        config: 'Sistema',
        analytics: 'Tiempo real'
      }
    });

  } catch (error) {
    console.error('Admin action counts error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching admin action counts'
      }
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getAdminActionCounts
};