import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShield, FiClock, FiAward } from 'react-icons/fi';

const HomePage = () => {
  const features = [
    {
      icon: FiHeart,
      title: 'Atención Especializada',
      description: 'Nuestro equipo de veterinarios está capacitado para brindar la mejor atención a tu mascota.'
    },
    {
      icon: FiShield,
      title: 'Tecnología Avanzada',
      description: 'Utilizamos equipos de última generación para diagnósticos precisos y tratamientos efectivos.'
    },
    {
      icon: FiClock,
      title: 'Disponibilidad 24/7',
      description: 'Servicio de emergencias disponible las 24 horas del día, todos los días del año.'
    },
    {
      icon: FiAward,
      title: 'Experiencia Comprobada',
      description: 'Más de 15 años cuidando la salud y bienestar de las mascotas de nuestra comunidad.'
    }
  ];

  const services = [
    {
      title: 'Consultas Médicas',
      description: 'Revisiones generales y diagnósticos especializados',
      image: '/api/placeholder/300/200'
    },
    {
      title: 'Cirugías',
      description: 'Procedimientos quirúrgicos con tecnología avanzada',
      image: '/api/placeholder/300/200'
    },
    {
      title: 'Vacunación',
      description: 'Programas completos de vacunación preventiva',
      image: '/api/placeholder/300/200'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Cuidamos a tu mascota como si fuera nuestra
              </h1>
              <p className="text-xl mb-8 text-primary-100 leading-relaxed">
                Atención veterinaria de calidad con un equipo profesional comprometido con el bienestar de tu compañero de vida.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn btn-secondary btn-lg">
                  Crear Cuenta
                </Link>
                <Link to="/productos" className="btn btn-outline text-white border-white hover:bg-white hover:text-primary-600">
                  Ver Productos
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-full h-96 bg-primary-500 rounded-2xl flex items-center justify-center">
                  <span className="text-8xl">🐶</span>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🚀</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              ¿Por qué elegir VetCare?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Nos dedicamos a proporcionar la mejor atención veterinaria con un enfoque integral y personalizado.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section bg-neutral-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Ofrecemos una amplia gama de servicios veterinarios para mantener a tu mascota saludable y feliz.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="card card-hover">
                <div className="h-48 bg-neutral-200 rounded-t-xl flex items-center justify-center">
                  <span className="text-6xl">🐈</span>
                </div>
                <div className="card-body">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {service.description}
                  </p>
                  <Link 
                    to="/register" 
                    className="btn btn-primary"
                  >
                    Agendar Cita
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            ¿Listo para cuidar a tu mascota?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de dueños de mascotas que confían en VetCare para el cuidado de sus compañeros.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-secondary btn-lg">
              Crear Cuenta Gratis
            </Link>
            <Link to="/login" className="btn btn-outline text-white border-white hover:bg-white hover:text-primary-600">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;