const { prisma } = require('../config/database');

// NOTA: Este controller ahora usa el middleware secureUpload para prevenir path traversal
// Ver: /src/middleware/secureUpload.js

const createProduct = async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Uploaded image:', req.uploadedImage);
    console.log('Content-Type:', req.headers['content-type']);
    
    const { name, description, price, stock, category } = req.body;
    let imageUrl = null;

    // Usar el nuevo sistema de upload seguro
    if (req.uploadedFile) {
      imageUrl = req.uploadedFile.secure_url;
      console.log('✅ Secure image URL set to:', imageUrl);
    } else if (req.uploadedImage) {
      // Fallback para compatibilidad con sistema anterior
      imageUrl = req.uploadedImage.secure_url;
      console.log('⚠️ Using legacy upload system:', imageUrl);
    } else {
      console.log('No uploaded image found');
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category: category || 'Alimentos',
        image: imageUrl,
        isActive: true
      }
    });

    console.log('Product created successfully:', product.id, 'with image:', product.image);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, category, isActive } = req.query;
    const userRole = req.user?.role;

    const where = {};
    
    // Non-admin users only see active products
    if (userRole !== 'ADMIN') {
      where.isActive = true;
    } else if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const total = await prisma.product.count({ where });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    const where = { id };
    
    // Non-admin users only see active products
    if (userRole !== 'ADMIN') {
      where.isActive = true;
    }

    const product = await prisma.product.findFirst({
      where
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, isActive, category } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (isActive !== undefined) updateData.isActive = isActive === 'true';
    if (category) updateData.category = category;

    if (req.uploadedImage) {
      updateData.image = req.uploadedImage.secure_url;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    // Check if product is in any orders
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: id }
    });

    if (orderItems) {
      // Soft delete - just mark as inactive
      await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });

      return res.json({
        success: true,
        message: 'Product deactivated successfully (has existing orders)'
      });
    }

    // Hard delete if no orders
    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock: parseInt(stock) },
      select: {
        id: true,
        name: true,
        stock: true
      }
    });

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Stock updated successfully'
    });

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

const uploadProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.uploadedImage) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_IMAGE',
          message: 'No image provided'
        }
      });
    }

    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { image: req.uploadedImage.secure_url },
      select: {
        id: true,
        name: true,
        image: true
      }
    });

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product image updated successfully'
    });

  } catch (error) {
    console.error('Upload product image error:', error);
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
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  uploadProductImage
};