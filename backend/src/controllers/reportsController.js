const { prisma } = require('../config/database');

// Función auxiliar para obtener rango de fechas
const getDateRange = (range) => {
  const now = new Date();
  let startDate, endDate = now;

  switch (range) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '12m':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { startDate, endDate };
};

// Resumen general de KPIs
const getDashboardOverview = async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = getDateRange(range);

    // Ingresos totales y cambio porcentual
    const [currentRevenue, previousRevenue] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startDate, lte: endDate }
        },
        _sum: { total: true },
        _count: { id: true }
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: {
            gte: new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime())),
            lt: startDate
          }
        },
        _sum: { total: true }
      })
    ]);

    // Clientes activos y nuevos
    const [activeClients, newClients] = await Promise.all([
      prisma.user.aggregate({
        where: {
          role: 'USER',
          orders: {
            some: {
              createdAt: { gte: startDate, lte: endDate }
            }
          }
        },
        _count: { id: true }
      }),
      prisma.user.aggregate({
        where: {
          role: 'USER',
          createdAt: { gte: startDate, lte: endDate }
        },
        _count: { id: true }
      })
    ]);

    // Citas completadas
    const appointments = await prisma.appointment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true }
    });

    // Calcular cambio porcentual de ingresos
    const revenueChange = previousRevenue._sum.total > 0 
      ? ((currentRevenue._sum.total - previousRevenue._sum.total) / previousRevenue._sum.total) * 100
      : 0;

    // Utilización de citas (asumiendo capacidad total)
    const totalAppointments = await prisma.appointment.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { id: true }
    });

    const utilization = totalAppointments._count.id > 0 
      ? (appointments._count.id / totalAppointments._count.id) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        revenue: {
          total: currentRevenue._sum.total || 0,
          change: revenueChange
        },
        clients: {
          active: activeClients._count.id || 0,
          new: newClients._count.id || 0,
          change: 8.3 // Placeholder - calcular cambio real
        },
        appointments: {
          completed: appointments._count.id || 0,
          change: 5.7 // Placeholder - calcular cambio real
        },
        utilization: {
          percentage: utilization,
          change: 2.1 // Placeholder - calcular cambio real
        }
      }
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching dashboard data'
      }
    });
  }
};

// Reportes financieros detallados
const getFinancialReports = async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = getDateRange(range);

    // Ingresos mensuales (últimos 6 meses)
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        SUM(total) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE status IN ('PROCESSING', 'SHIPPED', 'DELIVERED')
        AND createdAt >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month ASC
    `;

    // Productos más vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: { gte: startDate, lte: endDate }
        }
      },
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    // Obtener detalles de productos
    const productIds = topProducts.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: true, price: true }
    });

    const topProductsWithDetails = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name || 'Producto no encontrado',
        category: product?.category || 'Sin categoría',
        sales: item._sum.quantity,
        revenue: item._sum.price * item._sum.quantity
      };
    });

    // Ticket promedio
    const avgTransaction = await prisma.order.aggregate({
      where: {
        status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startDate, lte: endDate }
      },
      _avg: { total: true }
    });

    res.json({
      success: true,
      data: {
        monthlyRevenue: monthlyRevenue.map(item => ({
          month: item.month,
          revenue: parseFloat(item.revenue) || 0,
          orders: item.orders || 0,
          expenses: parseFloat(item.revenue) * 0.4 || 0 // Estimación 40% gastos
        })),
        topProducts: topProductsWithDetails,
        avgTransaction: avgTransaction._avg.total || 0
      }
    });

  } catch (error) {
    console.error('Financial reports error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching financial reports'
      }
    });
  }
};

// Reportes de clientes
const getClientReports = async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = getDateRange(range);

    // Total de clientes
    const totalClients = await prisma.user.count({
      where: { role: 'USER' }
    });

    // Nuevos clientes en el período
    const newClients = await prisma.user.count({
      where: {
        role: 'USER',
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // Clientes activos (con órdenes en el período)
    const activeClients = await prisma.user.count({
      where: {
        role: 'USER',
        orders: {
          some: {
            createdAt: { gte: startDate, lte: endDate }
          }
        }
      }
    });

    // Retención (clientes que hicieron más de 1 orden)
    const retentionData = await prisma.user.findMany({
      where: {
        role: 'USER',
        orders: {
          some: {
            createdAt: { gte: startDate, lte: endDate }
          }
        }
      },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    const retainedClients = retentionData.filter(client => client._count.orders > 1).length;
    const retentionRate = activeClients > 0 ? (retainedClients / activeClients) * 100 : 0;

    res.json({
      success: true,
      data: {
        total: totalClients,
        newClients,
        activeClients,
        retentionRate
      }
    });

  } catch (error) {
    console.error('Client reports error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching client reports'
      }
    });
  }
};

// Reportes operacionales
const getOperationalReports = async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = getDateRange(range);

    // Estadísticas de citas
    const [totalAppointments, completedAppointments, cancelledAppointments, pendingAppointments] = await Promise.all([
      prisma.appointment.count({
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.appointment.count({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.appointment.count({
        where: {
          status: 'CANCELLED',
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.appointment.count({
        where: {
          status: 'PENDING',
          createdAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    // Citas por día de la semana
    const dailyAppointments = await prisma.$queryRaw`
      SELECT 
        CASE strftime('%w', date)
          WHEN '0' THEN 'Domingo'
          WHEN '1' THEN 'Lunes' 
          WHEN '2' THEN 'Martes'
          WHEN '3' THEN 'Miércoles'
          WHEN '4' THEN 'Jueves'
          WHEN '5' THEN 'Viernes'
          WHEN '6' THEN 'Sábado'
        END as day,
        COUNT(*) as appointments
      FROM appointments 
      WHERE createdAt >= date('now', '-30 days')
      GROUP BY strftime('%w', date)
      ORDER BY strftime('%w', date)
    `;

    res.json({
      success: true,
      data: {
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          pending: pendingAppointments,
          utilization: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0
        },
        dailyAppointments: dailyAppointments.map(item => ({
          day: item.day,
          appointments: item.appointments,
          revenue: item.appointments * 95 // Estimación basada en ticket promedio
        }))
      }
    });

  } catch (error) {
    console.error('Operational reports error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching operational reports'
      }
    });
  }
};

// Reportes clínicos
const getClinicalReports = async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = getDateRange(range);

    // Diagnósticos más frecuentes
    const topDiagnoses = await prisma.diagnosis.groupBy({
      by: ['description'],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Distribución por especies
    const speciesDistribution = await prisma.pet.groupBy({
      where: {
        appointments: {
          some: {
            createdAt: { gte: startDate, lte: endDate }
          }
        }
      },
      by: ['species'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    res.json({
      success: true,
      data: {
        topDiagnoses: topDiagnoses.map(item => ({
          diagnosis: item.description,
          count: item._count.id
        })),
        speciesDistribution: speciesDistribution.map(item => ({
          species: item.species,
          count: item._count.id
        }))
      }
    });

  } catch (error) {
    console.error('Clinical reports error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching clinical reports'
      }
    });
  }
};

// Distribución de servicios
const getServicesDistribution = async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const { startDate, endDate } = getDateRange(range);

    // Obtener distribución de tipos de citas/servicios
    const servicesDistribution = await prisma.appointment.groupBy({
      by: ['reason'],
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Mapear a categorías más generales
    const categoryMapping = {
      'Consulta general': 'Consultas',
      'Vacunación': 'Vacunaciones', 
      'Cirugía': 'Cirugías',
      'Emergencia': 'Emergencias',
      'Control': 'Consultas',
      'Revisión': 'Consultas'
    };

    const categorizedServices = servicesDistribution.reduce((acc, service) => {
      const category = categoryMapping[service.reason] || 'Otros';
      const existing = acc.find(item => item.name === category);
      
      if (existing) {
        existing.value += service._count.id;
      } else {
        acc.push({
          name: category,
          value: service._count.id,
          color: getCategoryColor(category)
        });
      }
      
      return acc;
    }, []);

    res.json({
      success: true,
      data: categorizedServices
    });

  } catch (error) {
    console.error('Services distribution error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error fetching services distribution'
      }
    });
  }
};

// Función auxiliar para colores de categorías
const getCategoryColor = (category) => {
  const colors = {
    'Consultas': '#3b82f6',
    'Vacunaciones': '#10b981',
    'Cirugías': '#f59e0b',
    'Emergencias': '#ef4444',
    'Otros': '#8b5cf6'
  };
  return colors[category] || '#6b7280';
};

module.exports = {
  getDashboardOverview,
  getFinancialReports,
  getClientReports,
  getOperationalReports,
  getClinicalReports,
  getServicesDistribution
};