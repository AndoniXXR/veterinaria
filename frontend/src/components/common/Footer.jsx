import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navigationLinks = {
    company: [
      { name: 'Sobre Nosotros', href: '/sobre-nosotros' },
      { name: 'Servicios', href: '/servicios' },
      { name: 'Equipo Médico', href: '/veterinarios' },
      { name: 'Contacto', href: '/contacto' }
    ],
    services: [
      { name: 'Consultas Médicas', href: '/servicios/consultas' },
      { name: 'Cirugías', href: '/servicios/cirugias' },
      { name: 'Vacunación', href: '/servicios/vacunacion' },
      { name: 'Emergencias', href: '/servicios/emergencias' }
    ],
    support: [
      { name: 'Centro de Ayuda', href: '/ayuda' },
      { name: 'Términos de Servicio', href: '/terminos' },
      { name: 'Política de Privacidad', href: '/privacidad' },
      { name: 'Preguntas Frecuentes', href: '/faq' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: FiFacebook, href: '#' },
    { name: 'Instagram', icon: FiInstagram, href: '#' },
    { name: 'Twitter', icon: FiTwitter, href: '#' }
  ];

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🐶</span>
              </div>
              <span className="text-xl font-bold">VetCare</span>
            </div>
            <p className="text-neutral-400 mb-6 leading-relaxed">
              Brindamos atención veterinaria de calidad con tecnología moderna y un equipo comprometido con el bienestar de tus mascotas.
            </p>
            
            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-neutral-400">
                <FiPhone size={16} className="text-primary-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-neutral-400">
                <FiMail size={16} className="text-primary-400" />
                <span>info@vetcare.com</span>
              </div>
              <div className="flex items-start space-x-3 text-sm text-neutral-400">
                <FiMapPin size={16} className="text-primary-400 mt-0.5" />
                <span>123 Pet Street, Animal City, AC 12345</span>
              </div>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Empresa</h3>
            <ul className="space-y-3">
              {navigationLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios</h3>
            <ul className="space-y-3">
              {navigationLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Soporte</h3>
            <ul className="space-y-3">
              {navigationLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Social links */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Síguenos</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-primary-600 transition-colors duration-200"
                      aria-label={social.name}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="py-8 border-t border-neutral-800">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Mantente Informado</h3>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto">
              Suscríbete a nuestro boletín para recibir consejos de cuidado para mascotas y ofertas especiales.
            </p>
            <div className="max-w-md mx-auto flex space-x-3">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button className="btn btn-primary px-6">
                Suscribirse
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-neutral-400">
            © {currentYear} VetCare. Todos los derechos reservados.
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <Link 
              to="/privacidad" 
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Privacidad
            </Link>
            <Link 
              to="/terminos" 
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Términos
            </Link>
            <Link 
              to="/cookies" 
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;