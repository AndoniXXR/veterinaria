const { prisma } = require('../config/database');
const { createPaymentIntent, confirmPayment } = require('../config/stripe');

const createOrder = async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_CART',
          message: 'Cart cannot be empty'
        }
      });
    }

    // Validate products and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId, isActive: true }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: `Product ${item.productId} not found or inactive`
          }
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          }
        });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price // Store price at time of order
      });
    }

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          status: 'PENDING'
        }
      });

      // Create order items
      await tx.orderItem.createMany({
        data: orderItems.map(item => ({
          ...item,
          orderId: newOrder.id
        }))
      });

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    // Fetch complete order with items
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: completeOrder,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const where = { userId };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = { id };
    
    // Non-admin users can only see their own orders
    if (userRole !== 'ADMIN') {
      whereClause.userId = userId;
    }

    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        payment: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'card' } = req.body;
    const userId = req.user.id;

    // Find order
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found or already processed'
        }
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await createPaymentIntent(
      order.total,
      'usd',
      {
        orderId: order.id,
        userId: order.userId,
        customerEmail: order.user.email
      }
    );

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: 'USD',
        paymentMethod,
        transactionId: paymentIntent.id,
        status: 'pending'
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
        amount: order.total
      },
      message: 'Payment intent created successfully'
    });

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PAYMENT_ERROR',
        message: 'Error processing payment'
      }
    });
  }
};

const confirmOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    // Verify payment with Stripe
    const paymentIntent = await confirmPayment(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_FAILED',
          message: 'Payment was not successful'
        }
      });
    }

    // Update order and payment status
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update payment status
      await tx.payment.updateMany({
        where: {
          orderId: id,
          transactionId: paymentIntentId
        },
        data: {
          status: 'completed'
        }
      });

      // Update order status
      return await tx.order.update({
        where: { id },
        data: { status: 'PAID' },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          },
          payment: true
        }
      });
    });

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Payment confirmed successfully'
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId,
        status: { in: ['PENDING', 'PAID'] }
      },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found or cannot be cancelled'
        }
      });
    }

    // Restore product stock and cancel order
    await prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      // Update order status
      await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Admin endpoints
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid order status'
        }
      });
    }

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getSalesStats = async (req, res) => {
  try {
    // Obtener ventas totales de órdenes pagadas
    const totalSales = await prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    });

    // Obtener ventas del mes actual
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);

    const monthlySales = await prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    });

    // Obtener productos más vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }
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
      take: 5
    });

    // Obtener información de los productos más vendidos
    const productIds = topProducts.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        category: true,
        image: true
      }
    });

    const topProductsWithDetails = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product
      };
    });

    res.json({
      success: true,
      data: {
        totalSales: {
          amount: totalSales._sum.total || 0,
          orders: totalSales._count.id || 0
        },
        monthlySales: {
          amount: monthlySales._sum.total || 0,
          orders: monthlySales._count.id || 0
        },
        topProducts: topProductsWithDetails
      }
    });

  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  processPayment,
  confirmOrderPayment,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getSalesStats
};