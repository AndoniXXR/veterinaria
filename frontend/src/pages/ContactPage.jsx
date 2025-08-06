import React, { useState } from 'react';
import { 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiClock, 
  FiSend, 
  FiUser, 
  FiMessageSquare,
  FiCalendar,
  FiHeart
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    urgency: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('¡Mensaje enviado correctamente! Te contactaremos pronto.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        urgency: 'normal'
      });
    } catch (error) {
      toast.error('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = {
    address: 'Avenida Las Américas 15-85, Zona 13, Ciudad de Guatemala',
    phone: '+502 2362-4789',
    whatsapp: '+502 5678-9012',
    email: 'info@vetcareguatemala.com',
    emergencyPhone: '+502 2362-4790'
  };

  const hours = [
    { day: 'Lunes - Viernes', hours: '7:00 AM - 8:00 PM' },
    { day: 'Sábados', hours: '8:00 AM - 6:00 PM' },
    { day: 'Domingos', hours: '9:00 AM - 2:00 PM' },
    { day: 'Emergencias', hours: '24/7 (Solo urgencias)' }
  ];

  const services = [
    'Consultas veterinarias generales',
    'Cirugías especializadas',
    'Laboratorio clínico',
    'Rayos X digitales',
    'Hospitalización',
    'Grooming y estética',
    'Farmacia veterinaria',
    'Emergencias 24/7'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contáctanos
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Estamos aquí para cuidar de tu mascota. ¡Contáctanos para cualquier consulta o emergencia!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href={`tel:${contactInfo.phone}`}
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-flex items-center gap-2"
              >
                <FiPhone size={20} />
                Llamar Ahora
              </a>
              <a 
                href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center gap-2"
              >
                <FiMessageSquare size={20} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-3">
                Envíanos un Mensaje
              </h2>
              <p className="text-neutral-600">
                Completa el formulario y nos pondremos en contacto contigo
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+502 0000-0000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Asunto *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Urgencia
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgente</option>
                  <option value="emergency">Emergencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Describe tu consulta o situación..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSend size={18} />
                )}
                {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                <FiMapPin className="text-primary-600" size={28} />
                Información de Contacto
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Dirección</h4>
                    <p className="text-neutral-600">{contactInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiPhone className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Teléfonos</h4>
                    <p className="text-neutral-600">Principal: {contactInfo.phone}</p>
                    <p className="text-neutral-600">WhatsApp: {contactInfo.whatsapp}</p>
                    <p className="text-red-600 font-semibold">Emergencias: {contactInfo.emergencyPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiMail className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Email</h4>
                    <p className="text-neutral-600">{contactInfo.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                <FiClock className="text-primary-600" size={28} />
                Horarios de Atención
              </h3>

              <div className="space-y-4">
                {hours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-b-0">
                    <span className="font-medium text-neutral-900">{schedule.day}</span>
                    <span className="text-neutral-600">{schedule.hours}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 font-semibold flex items-center gap-2">
                  <FiHeart className="text-red-600" size={16} />
                  Para emergencias fuera de horario, llama al {contactInfo.emergencyPhone}
                </p>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                Nuestros Servicios
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-3 py-2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
                    <span className="text-neutral-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">
              Nuestra Ubicación
            </h2>
            <p className="text-neutral-600">
              Nos encontramos en una ubicación central y accesible en la Ciudad de Guatemala
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="h-96 bg-neutral-100 relative">
              {/* Google Maps Embed */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.259429!2d-90.513!3d14.6349!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8589a3b7b1234567%3A0x1234567890abcdef!2sAv.%20Las%20Am%C3%A9ricas%2015-85%2C%20Zona%2013%2C%20Ciudad%20de%20Guatemala!5e0!3m2!1ses!2sgt!4v1691234567890!5m2!1ses!2sgt"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación VetCare Guatemala"
                className="absolute inset-0"
              />
            </div>
            
            <div className="p-6 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <FiMapPin className="mx-auto mb-2" size={24} />
                  <h4 className="font-semibold mb-1">Fácil Acceso</h4>
                  <p className="text-primary-100 text-sm">Zona 13, cerca de centros comerciales</p>
                </div>
                <div>
                  <FiCalendar className="mx-auto mb-2" size={24} />
                  <h4 className="font-semibold mb-1">Citas Online</h4>
                  <p className="text-primary-100 text-sm">Agenda tu cita desde nuestra web</p>
                </div>
                <div>
                  <FiPhone className="mx-auto mb-2" size={24} />
                  <h4 className="font-semibold mb-1">Atención 24/7</h4>
                  <p className="text-primary-100 text-sm">Emergencias atendidas siempre</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;