import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiShoppingCart, FiCalendar, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CartSidebar from '../cart/CartSidebar';
import clsx from 'clsx';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin, isVeterinarian, isUser } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return [
        { name: 'Inicio', href: '/', current: false },
        { name: 'Productos', href: '/productos', current: false },
        { name: 'Servicios', href: '/servicios', current: false },
        { name: 'Contacto', href: '/contacto', current: false }
      ];
    }

    if (isAdmin()) {
      return [
        { name: 'Dashboard', href: '/admin', current: false },
        { name: 'Usuarios', href: '/admin/usuarios', current: false },
        { name: 'Veterinarios', href: '/admin/veterinarios', current: false },
        { name: 'Productos', href: '/admin/productos', current: false },
        { name: 'Órdenes', href: '/admin/ordenes', current: false },
        { name: 'Configuración', href: '/admin/configuracion', current: false },
        { name: 'Reportes', href: '/admin/reportes', current: false }
      ];
    }

    if (isVeterinarian()) {
      return [
        { name: 'Dashboard', href: '/vet', current: false },
        { name: 'Calendario', href: '/vet/calendario', current: false },
        { name: 'Pacientes', href: '/vet/pacientes', current: false },
        { name: 'Diagnósticos', href: '/vet/diagnosticos', current: false }
      ];
    }

    if (isUser()) {
      return [
        { name: 'Dashboard', href: '/dashboard', current: false },
        { name: 'Mis Mascotas', href: '/mascotas', current: false },
        { name: 'Citas', href: '/citas', current: false },
        { name: 'Productos', href: '/productos', current: false },
        { name: 'Mis Órdenes', href: '/ordenes', current: false }
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-40">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🐶</span>
              </div>
              <span className="text-xl font-bold text-neutral-900">VetCare</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'hover:bg-neutral-100 hover:text-neutral-900',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
              aria-label="Carrito de compras"
            >
              <FiShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* User menu or Auth buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                >
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-neutral-300 rounded-full flex items-center justify-center">
                      <FiUser size={16} className="text-neutral-600" />
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium text-neutral-700">
                    {user?.name}
                  </span>
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-medium border border-neutral-200 py-1 z-50">
                    <Link
                      to="/perfil"
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiUser className="mr-3" size={16} />
                      Mi Perfil
                    </Link>
                    
                    {isUser() && (
                      <Link
                        to="/citas"
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiCalendar className="mr-3" size={16} />
                        Mis Citas
                      </Link>
                    )}
                    
                    {(isAdmin() || isVeterinarian()) && (
                      <Link
                        to={isAdmin() ? '/admin/configuracion' : '/vet/configuracion'}
                        className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FiSettings className="mr-3" size={16} />
                        Configuración
                      </Link>
                    )}
                    
                    <hr className="my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <FiLogOut className="mr-3" size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="btn btn-ghost"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
              aria-label="Menú móvil"
            >
              {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
                  onClick={closeMobileMenu}
                >
                  {item.name}
                </Link>
              ))}
              
              {!isAuthenticated && (
                <div className="pt-4 border-t border-neutral-200 space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </header>
  );
};

export default Header;