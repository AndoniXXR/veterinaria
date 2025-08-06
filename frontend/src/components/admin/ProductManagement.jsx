import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiPackage, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import Modal, { ModalBody, ModalFooter } from '../common/Modal';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import toast from 'react-hot-toast';

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    status: 'ACTIVE',
    category: 'Alimentos'
  });
  const [products, setProducts] = useState([]);
  const [salesStats, setSalesStats] = useState({
    totalSales: { amount: 0, orders: 0 },
    monthlySales: { amount: 0, orders: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const categories = ['Todos', 'Alimentos', 'Juguetes', 'Accesorios', 'Medicamentos', 'Higiene'];

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts();
      if (response.success) {
        setProducts(response.data.products);
      } else {
        toast.error('Error al cargar productos');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Fetch sales statistics
  const fetchSalesStats = async () => {
    try {
      const response = await orderService.getSalesStats();
      if (response.success) {
        setSalesStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      // No mostrar error toast aquí para no molestar al usuario
    }
  };

  // Load products and sales stats on component mount
  useEffect(() => {
    fetchProducts();
    fetchSalesStats();
  }, []);

  const filteredProducts = products.filter(product => {
    const categoryMatch = categoryFilter === 'all' || product.category === categoryFilter;
    const searchMatch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const stockMatch = !showOutOfStock || product.stock === 0;
    
    return categoryMatch && searchMatch && stockMatch;
  });

  const getStatusColor = (product) => {
    if (!product.isActive) {
      return 'bg-red-100 text-red-800';
    } else if (product.stock === 0) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  const getStatusLabel = (product) => {
    if (!product.isActive) {
      return 'Inactivo';
    } else if (product.stock === 0) {
      return 'Agotado';
    } else {
      return 'Activo';
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    const initialFormData = {
      name: '',
      description: '',
      price: '',
      stock: '',
      status: 'ACTIVE',
      category: 'Alimentos'
    };
    setFormData(initialFormData);
    setSelectedImage(null);
    setImagePreview(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      status: product.isActive ? 'ACTIVE' : 'INACTIVE',
      category: product.category || 'Alimentos'
    });
    setSelectedImage(null);
    setImagePreview(product.image || null);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
      try {
        await productService.deleteProduct(product.id);
        toast.success('Producto eliminado exitosamente');
        await fetchProducts(); // Refresh list
        await fetchSalesStats(); // Refresh sales stats
      } catch (error) {
        console.error('Error deleting product:', error);
        if (error.response?.data?.error?.message) {
          toast.error(error.response.data.error.message);
        } else {
          toast.error('Error al eliminar el producto');
        }
      }
    }
  };

  const closeModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setSelectedImage(null);
    setImagePreview(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      status: 'ACTIVE',
      category: 'Alimentos'
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      console.log('Archivo seleccionado:', file.name);
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Additional validation
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast.error('El precio debe ser un número mayor a 0');
      return;
    }

    if (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      toast.error('El stock debe ser un número entero mayor o igual a 0');
      return;
    }

    setCreating(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description ? formData.description.trim() : '',
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category
      };

      // Add image if selected
      if (selectedImage) {
        productData.image = selectedImage;
      }

      console.log('Sending product data:', productData); // Debug log
      console.log('Form data before processing:', formData); // Debug log
      console.log('Auth token:', localStorage.getItem('authToken')); // Debug log

      let response;
      if (selectedProduct) {
        // Update existing product
        response = await productService.updateProduct(selectedProduct.id, productData);
        toast.success('Producto actualizado exitosamente');
      } else {
        // Create new product
        response = await productService.createProduct(productData);
        toast.success('Producto creado exitosamente');
      }

      // Refresh products list and sales stats
      await fetchProducts();
      await fetchSalesStats();
      closeModal();

    } catch (error) {
      console.error('Error saving product:', error);
      if (error.response?.data?.error?.message) {
        toast.error(error.response.data.error.message);
      } else {
        toast.error('Error al guardar el producto');
      }
    } finally {
      setCreating(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(price);
  };

  const handleOutOfStockClick = () => {
    setShowOutOfStock(!showOutOfStock);
    setCategoryFilter('all'); // Reset category filter when showing out of stock
    setSearchTerm(''); // Reset search when showing out of stock
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-neutral-300">☆</span>);
    }
    
    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Gestión de Productos
          </h2>
          <p className="text-neutral-600">
            Administra el catálogo de productos y controla el inventario.
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" size={16} />
          Nuevo Producto
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FiPackage className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{products.length}</div>
            <div className="text-sm text-neutral-600">Productos Totales</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FiBarChart2 className="text-green-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {products.filter(p => p.isActive).length}
            </div>
            <div className="text-sm text-neutral-600">Productos Activos</div>
          </div>
        </div>
        
        <div 
          className={`card cursor-pointer transition-all hover:shadow-lg ${
            showOutOfStock ? 'ring-2 ring-red-500 bg-red-50' : ''
          }`}
          onClick={handleOutOfStockClick}
        >
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FiPackage className="text-red-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {products.filter(p => p.stock === 0).length}
            </div>
            <div className="text-sm text-neutral-600">
              Sin Stock {showOutOfStock ? '(Filtrado)' : '(Click para filtrar)'}
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FiDollarSign className="text-yellow-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {formatPrice(salesStats.totalSales.amount)}
            </div>
            <div className="text-sm text-neutral-600">
              Ventas Totales ({salesStats.totalSales.orders} órdenes)
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category === 'Todos' ? 'all' : category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                (categoryFilter === 'all' && category === 'Todos') || categoryFilter === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Out of Stock Filter Indicator */}
      {showOutOfStock && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <FiPackage className="text-red-600 mr-2" size={20} />
            <span className="text-red-800 font-medium">
              Mostrando solo productos sin stock ({filteredProducts.length} productos)
            </span>
          </div>
          <button
            onClick={handleOutOfStockClick}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            Mostrar todos
          </button>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-neutral-600">Cargando productos...</span>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card">
              <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-neutral-500">
                        ID: {product.id.substring(0, 8)}...
                      </span>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product)}`}>
                        {getStatusLabel(product)}
                      </div>
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Product Image */}
                <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center mb-4 mx-auto overflow-hidden">
                  {product.image ? (
                    <>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span className="text-xl" style={{ display: 'none' }}>
                        📦
                      </span>
                    </>
                  ) : (
                    <span className="text-xl">
                      📦
                    </span>
                  )}
                </div>

                {/* Price and Category */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xl font-bold text-primary-600">
                    {formatPrice(product.price)}
                  </div>
                  <div className="text-sm text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                    {product.category || 'Producto'}
                  </div>
                </div>

                {/* Created date */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-neutral-600">
                    Creado: {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Stock */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-600">Stock disponible</span>
                    <span className={`font-medium ${
                      product.stock > 10 
                        ? 'text-green-600' 
                        : product.stock > 0 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {product.stock} unidades
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        product.stock > 10 
                          ? 'bg-green-500' 
                          : product.stock > 0 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="btn btn-outline btn-sm flex items-center"
                    >
                      <FiEdit className="mr-1" size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="text-xs text-yellow-600 font-medium">
                      Stock bajo
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-8xl mb-6">📦</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">
            No se encontraron productos
          </h3>
          <p className="text-neutral-600 mb-8">
            {searchTerm ? 'Intenta ajustar los términos de búsqueda.' : 'Aún no hay productos en el catálogo.'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddProduct}
              className="btn btn-primary flex items-center mx-auto"
            >
              <FiPlus className="mr-2" size={16} />
              Agregar Primer Producto
            </button>
          )}
        </div>
      )}

      {/* Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={closeModal}
        title={selectedProduct ? `Editar ${selectedProduct.name}` : 'Nuevo Producto'}
        size="lg"
      >
        <ModalBody>
          <form className="space-y-6">
            {/* Basic Info */}
            <div className="form-group">
              <label className="form-label">Nombre del Producto *</label>
              <input
                type="text"
                className="input"
                placeholder="Nombre del producto"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="input min-h-[100px] resize-none"
                placeholder="Descripción del producto"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            {/* Price */}
            <div className="form-group">
              <label className="form-label">Precio *</label>
              <input
                type="number"
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select 
                className="input" 
                value={formData.category || 'Alimentos'}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="Alimentos">Alimentos</option>
                <option value="Juguetes">Juguetes</option>
                <option value="Accesorios">Accesorios</option>
                <option value="Medicamentos">Medicamentos</option>
                <option value="Higiene">Higiene</option>
              </select>
            </div>

            {/* Stock and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Stock Inicial *</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0"
                  min="0"
                  value={formData.stock || ''}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select 
                  className="input" 
                  value={formData.status || 'ACTIVE'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">Imagen del Producto</label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="Vista previa" 
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm text-neutral-600">
                      {selectedImage ? selectedImage.name : 'Imagen actual'}
                    </p>
                    <button 
                      type="button" 
                      className="btn btn-outline btn-sm"
                      onClick={() => document.getElementById('product-image-input').click()}
                    >
                      Cambiar Imagen
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-neutral-600 mb-4">
                      Arrastra una imagen aquí o haz clic para seleccionar
                    </p>
                    <button 
                      type="button" 
                      className="btn btn-outline btn-sm"
                      onClick={() => document.getElementById('product-image-input').click()}
                    >
                      Seleccionar Imagen
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  id="product-image-input"
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </form>
        </ModalBody>
        
        <ModalFooter>
          <button onClick={closeModal} className="btn btn-outline" disabled={creating}>
            Cancelar
          </button>
          <button onClick={handleSubmit} className="btn btn-primary" disabled={creating}>
            {creating 
              ? (selectedProduct ? 'Actualizando...' : 'Creando...') 
              : (selectedProduct ? 'Actualizar' : 'Crear') + ' Producto'
            }
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProductManagement;