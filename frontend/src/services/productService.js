import api, { buildQueryString, createFormData } from './api';

export const productService = {
  // Get products (public endpoint)
  getProducts: async (params = {}) => {
    try {
      const queryString = buildQueryString(params);
      const url = queryString ? `/products?${queryString}` : '/products';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get specific product
  getProduct: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search products
  searchProducts: async (searchTerm, params = {}) => {
    try {
      const searchParams = { ...params, search: searchTerm };
      return await productService.getProducts(searchParams);
    } catch (error) {
      throw error;
    }
  },

  // Admin endpoints
  createProduct: async (productData) => {
    try {
      console.log('🚀 ProductService.createProduct called with:', productData);
      let requestData = productData;
      let config = {};

      // Check if there's an image file
      if (productData.image instanceof File) {
        console.log('📁 File detected, creating FormData...');
        requestData = createFormData(productData, ['image']);
        console.log('📦 FormData created:', requestData);
        // Don't set Content-Type manually for FormData - let axios handle it
      }

      console.log('🌐 Making POST request to /products...');
      const response = await api.post('/products', requestData, config);
      console.log('✅ Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error in createProduct:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (productId, productData) => {
    try {
      let requestData = productData;
      let config = {};

      // Check if there's an image file
      if (productData.image instanceof File) {
        requestData = createFormData(productData, ['image']);
        // Don't set Content-Type manually for FormData - let axios handle it
      }

      const response = await api.put(`/products/${productId}`, requestData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update product stock
  updateProductStock: async (productId, stock) => {
    try {
      const response = await api.put(`/products/${productId}/stock`, { stock });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload product image
  uploadProductImage: async (productId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post(`/products/${productId}/image`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Format price for display
  formatPrice: (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  },

  // Check if product is in stock
  isInStock: (product) => {
    return product.stock > 0;
  },

  // Get stock status
  getStockStatus: (product) => {
    if (product.stock === 0) {
      return { status: 'out_of_stock', label: 'Agotado', class: 'badge-danger' };
    } else if (product.stock <= 5) {
      return { status: 'low_stock', label: 'Pocas unidades', class: 'badge-warning' };
    } else {
      return { status: 'in_stock', label: 'Disponible', class: 'badge-success' };
    }
  },

  // Calculate discount percentage
  calculateDiscountPercentage: (originalPrice, salePrice) => {
    if (originalPrice <= salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  },

  // Filter products by category
  filterByCategory: (products, category) => {
    if (!category || category === 'all') return products;
    return products.filter(product => 
      product.category?.toLowerCase() === category.toLowerCase()
    );
  },

  // Sort products
  sortProducts: (products, sortBy) => {
    const sortedProducts = [...products];
    
    switch (sortBy) {
      case 'name_asc':
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
      case 'price_asc':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'newest':
        return sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sortedProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return sortedProducts;
    }
  }
};

export default productService;