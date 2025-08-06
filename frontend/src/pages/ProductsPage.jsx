import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiSearch, FiLoader } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleAddToCart = (product) => {
    addItem(product, 1);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Since we don't have categories in DB, just filter by search for now
    
    return matchesSearch && product.isActive;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(price);
  };

  const renderStars = (rating = 4.0) => {
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
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Catálogo de Productos
        </h1>
        <p className="text-neutral-600">
          Encuentra todo lo que necesitas para el cuidado de tu mascota.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Category Filter - Disabled for now */}
        <div className="text-sm text-neutral-500">
          Filtros por categoría disponibles próximamente
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <FiLoader className="animate-spin text-primary-600" size={32} />
          <span className="ml-3 text-neutral-600">Cargando productos...</span>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
          <div key={product.id} className="card card-hover group">
            {/* Product Image */}
            <div className="aspect-square bg-neutral-100 rounded-t-xl flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <div 
                className={`flex items-center justify-center text-6xl ${product.image ? 'hidden' : 'block'}`}
                style={{ display: product.image ? 'none' : 'flex' }}
              >
                🐶
              </div>
            </div>
            
            <div className="card-body">
              {/* Product Info */}
              <div className="mb-4">
                <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-2">
                    {renderStars(4.0)}
                  </div>
                  <span className="text-sm text-neutral-500">(4.0)</span>
                </div>
                <div className="text-sm text-neutral-500 mb-2">
                  Producto veterinario
                </div>
              </div>
              
              {/* Price and Stock */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-xl font-bold text-primary-600">
                  {formatPrice(product.price)}
                </div>
                <div className={`text-sm px-2 py-1 rounded ${
                  product.stock > 10
                    ? 'bg-green-100 text-green-800'
                    : product.stock > 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <button 
                className={`w-full btn flex items-center justify-center ${
                  product.stock > 0
                    ? 'btn-primary'
                    : 'btn-outline opacity-50 cursor-not-allowed'
                }`}
                disabled={product.stock === 0}
                onClick={() => handleAddToCart(product)}
              >
                <FiShoppingCart className="mr-2" size={16} />
                {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
              </button>
            </div>
          </div>
              ))}
            </div>
          ) : (
            /* No Products Found */
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                {searchTerm 
                  ? 'No se encontraron productos' 
                  : 'No hay productos disponibles'}
              </h3>
              <p className="text-neutral-600 mb-8">
                {searchTerm 
                  ? `No hay productos que coincidan con "${searchTerm}". Intenta con otros términos de búsqueda.`
                  : 'Aún no hay productos en el catálogo. Regresa pronto para ver nuevos productos.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                  }}
                  className="btn btn-primary"
                >
                  Ver todos los productos
                </button>
              )}
            </div>
          )}

          {/* Load More - only show if there are products */}
          {filteredProducts.length > 0 && (
            <div className="text-center mt-12">
              <button className="btn btn-outline">
                Cargar Más Productos
              </button>
            </div>
          )}

      {/* Newsletter */}
      <div className="mt-16 card bg-primary-50 border-primary-200">
        <div className="card-body text-center">
          <h3 className="text-xl font-semibold text-primary-900 mb-2">
            ¿Quieres ofertas exclusivas?
          </h3>
          <p className="text-primary-700 mb-6">
            Suscríbete a nuestro boletín y recibe descuentos especiales en productos para tu mascota.
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Tu email"
              className="flex-1 input"
            />
            <button className="btn btn-primary">
              Suscribirse
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default ProductsPage;