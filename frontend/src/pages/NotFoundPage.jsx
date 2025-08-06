import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center px-4">
        {/* Error illustration */}
        <div className="mb-8">
          <div className="text-9xl mb-4">🐶</div>
          <div className="text-6xl font-bold text-neutral-300 mb-2">404</div>
          <div className="w-24 h-1 bg-primary-600 mx-auto rounded"></div>
        </div>
        
        {/* Error message */}
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">
            ¡Ups! Página no encontrada
          </h1>
          <p className="text-neutral-600 mb-8 leading-relaxed">
            Parece que la página que buscas se fue a perseguir su cola. 
            No te preocupes, podemos ayudarte a encontrar el camino de vuelta.
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="btn btn-primary flex items-center justify-center"
            >
              <FiHome className="mr-2" size={16} />
              Ir al Inicio
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-outline flex items-center justify-center"
            >
              <FiArrowLeft className="mr-2" size={16} />
              Regresar
            </button>
          </div>
        </div>
        
        {/* Help section */}
        <div className="mt-12 text-sm text-neutral-500">
          <p className="mb-2">¿Necesitas ayuda?</p>
          <div className="space-x-4">
            <Link 
              to="/contacto" 
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              Contacto
            </Link>
            <span>•</span>
            <Link 
              to="/ayuda" 
              className="text-primary-600 hover:text-primary-700 transition-colors"
            >
              Centro de Ayuda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;