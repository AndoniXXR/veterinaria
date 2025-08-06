import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStethoscope, FaSyringe, FaXRay, FaHeart, FaCut, FaUserMd, FaClock, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ServiciosPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleAgendarCita = () => {
    if (isAuthenticated) {
      // Usuario autenticado, redirigir a página de citas
      navigate('/citas');
      toast.success('Redirigiendo a tus citas...');
    } else {
      // Usuario no autenticado, redirigir a login con return URL
      toast('Necesitas iniciar sesión para agendar una cita', {
        icon: 'ℹ️',
        style: {
          background: '#3b82f6',
          color: '#fff',
        },
      });
      navigate('/login', { state: { from: '/citas', message: 'Inicia sesión para agendar tu cita' } });
    }
  };

  const servicios = [
    {
      id: 1,
      titulo: "Consulta Veterinaria General",
      descripcion: "Examen completo de salud, diagnóstico y tratamiento para tu mascota",
      icono: <FaStethoscope />,
      precio: "Desde Q192",
      duracion: "30-45 min"
    },
    {
      id: 2,
      titulo: "Vacunación",
      descripcion: "Programa completo de vacunación para cachorros y mascotas adultas",
      icono: <FaSyringe />,
      precio: "Desde Q115",
      duracion: "15-20 min"
    },
    {
      id: 3,
      titulo: "Radiografías",
      descripcion: "Diagnóstico por imágenes para detectar problemas internos",
      icono: <FaXRay />,
      precio: "Desde Q308",
      duracion: "20-30 min"
    },
    {
      id: 4,
      titulo: "Cirugía General",
      descripcion: "Procedimientos quirúrgicos menores y mayores con equipos modernos",
      icono: <FaCut />,
      precio: "Desde Q616",
      duracion: "1-3 horas"
    },
    {
      id: 5,
      titulo: "Cardiología",
      descripcion: "Especialista en problemas cardíacos y circulatorios",
      icono: <FaHeart />,
      precio: "Desde Q385",
      duracion: "45-60 min"
    },
    {
      id: 6,
      titulo: "Emergencias 24/7",
      descripcion: "Atención de urgencias las 24 horas del día, todos los días",
      icono: <FaUserMd />,
      precio: "Consulta inmediata",
      duracion: "Variable"
    }
  ];

  const horarios = [
    { dia: "Lunes - Viernes", horario: "8:00 AM - 8:00 PM" },
    { dia: "Sábados", horario: "9:00 AM - 6:00 PM" },
    { dia: "Domingos", horario: "10:00 AM - 4:00 PM" },
    { dia: "Emergencias", horario: "24/7 todos los días" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Nuestros Servicios
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Cuidado integral para tu mascota con tecnología de vanguardia y profesionales especializados
            </p>
            <button 
              onClick={handleAgendarCita}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Agendar Cita
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Servicios Profesionales
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una amplia gama de servicios veterinarios para mantener a tu mascota saludable y feliz
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicios.map((servicio) => (
              <div key={servicio.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-blue-600 text-4xl mb-4">
                  {servicio.icono}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {servicio.titulo}
                </h3>
                <p className="text-gray-600 mb-4">
                  {servicio.descripcion}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">
                    {servicio.precio}
                  </span>
                  <div className="flex items-center text-gray-500">
                    <FaClock className="mr-1" />
                    <span className="text-sm">{servicio.duracion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              ¿Por Qué Elegirnos?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUserMd className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Veterinarios Expertos</h3>
              <p className="text-gray-600">
                Nuestro equipo cuenta con más de 15 años de experiencia en el cuidado animal
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeart className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Atención Personalizada</h3>
              <p className="text-gray-600">
                Cada mascota recibe un plan de tratamiento personalizado según sus necesidades
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaXRay className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tecnología Avanzada</h3>
              <p className="text-gray-600">
                Equipos de última generación para diagnósticos precisos y tratamientos efectivos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule and Contact */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Schedule */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaClock className="mr-3 text-blue-600" />
                Horarios de Atención
              </h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                {horarios.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                    <span className="font-medium text-gray-700">{item.dia}</span>
                    <span className="text-blue-600 font-semibold">{item.horario}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Información de Contacto
              </h3>
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <div className="flex items-center">
                  <FaPhone className="text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <p className="text-gray-600">(+1) 234-567-8900</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">Dirección</p>
                    <p className="text-gray-600">123 Calle Principal, Ciudad, CP 12345</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaUserMd className="text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">Emergencias</p>
                    <p className="text-gray-600">Línea directa 24/7: (+1) 234-567-8911</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para Cuidar a tu Mascota?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Programa una cita hoy mismo y dale a tu mascota el cuidado que se merece
          </p>
          <div className="space-x-4">
            <button 
              onClick={handleAgendarCita}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Agendar Cita
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Llamar Ahora
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiciosPage;