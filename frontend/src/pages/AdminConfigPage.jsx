import React, { useState, useEffect } from 'react';
import { 
  FiSettings, 
  FiSave, 
  FiRefreshCw, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiClock,
  FiDollarSign,
  FiGlobe,
  FiShield,
  FiDatabase,
  FiUsers,
  FiBell,
  FiImage,
  FiEdit
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminConfigPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados para configuraciones
  const [generalConfig, setGeneralConfig] = useState({
    clinicName: 'Veterinaria San Marcos',
    description: 'Clínica veterinaria especializada en el cuidado integral de mascotas',
    address: 'Av. Principal 123, Ciudad',
    phone: '+502 1234-5678',
    email: 'info@veterinariasanmarcos.com',
    website: 'www.veterinariasanmarcos.com',
    logo: null,
    timezone: 'America/Guatemala',
    currency: 'GTQ'
  });

  const [businessConfig, setBusinessConfig] = useState({
    openingHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '14:00', closed: false },
      sunday: { open: '08:00', close: '12:00', closed: true }
    },
    appointmentDuration: 30,
    maxAdvanceBooking: 30,
    cancellationPolicy: 24,
    emergencyPhone: '+502 1234-5679'
  });

  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    enableNotifications: true,
    enableSMS: false,
    enableEmailMarketing: true,
    backupFrequency: 'daily',
    logRetention: 30
  });

  const [notificationConfig, setNotificationConfig] = useState({
    appointmentReminders: true,
    paymentConfirmations: true,
    orderUpdates: true,
    systemAlerts: true,
    marketingEmails: false,
    smsNotifications: false,
    reminderHours: 24,
    emailTemplate: 'modern'
  });

  const tabs = [
    { 
      id: 'general', 
      label: 'General', 
      icon: FiSettings,
      description: 'Información básica de la clínica'
    },
    { 
      id: 'business', 
      label: 'Negocio', 
      icon: FiClock,
      description: 'Horarios y políticas'
    },
    { 
      id: 'system', 
      label: 'Sistema', 
      icon: FiShield,
      description: 'Configuraciones técnicas'
    },
    { 
      id: 'notifications', 
      label: 'Notificaciones', 
      icon: FiBell,
      description: 'Alertas y comunicaciones'
    }
  ];

  const handleGeneralChange = (field, value) => {
    setGeneralConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessChange = (field, value) => {
    setBusinessConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day, field, value) => {
    setBusinessConfig(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSystemChange = (field, value) => {
    setSystemConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simular llamada al backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí irían las llamadas reales al backend para guardar cada configuración
      console.log('Saving configurations:', {
        general: generalConfig,
        business: businessConfig,
        system: systemConfig,
        notifications: notificationConfig
      });
      
      toast.success('Configuraciones guardadas exitosamente');
    } catch (error) {
      toast.error('Error al guardar las configuraciones');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // Reset a valores por defecto
    if (window.confirm('¿Estás seguro de que quieres restaurar las configuraciones por defecto?')) {
      // Aquí podrías cargar las configuraciones por defecto desde el backend
      toast.success('Configuraciones restauradas');
    }
  };

  const getDayLabel = (day) => {
    const labels = {
      monday: 'Lunes',
      tuesday: 'Martes', 
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    return labels[day];
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold flex items-center">
            <FiGlobe className="mr-2" />
            Información de la Clínica
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Nombre de la Clínica *</label>
              <input
                type="text"
                className="input"
                value={generalConfig.clinicName}
                onChange={(e) => handleGeneralChange('clinicName', e.target.value)}
                placeholder="Nombre de tu veterinaria"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Sitio Web</label>
              <input
                type="url"
                className="input"
                value={generalConfig.website}
                onChange={(e) => handleGeneralChange('website', e.target.value)}
                placeholder="www.tuveterinaria.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="input min-h-[100px] resize-none"
              value={generalConfig.description}
              onChange={(e) => handleGeneralChange('description', e.target.value)}
              placeholder="Descripción breve de tu veterinaria"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label flex items-center">
                <FiMail className="mr-2" size={16} />
                Email de Contacto *
              </label>
              <input
                type="email"
                className="input"
                value={generalConfig.email}
                onChange={(e) => handleGeneralChange('email', e.target.value)}
                placeholder="contacto@veterinaria.com"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label flex items-center">
                <FiPhone className="mr-2" size={16} />
                Teléfono Principal *
              </label>
              <input
                type="tel"
                className="input"
                value={generalConfig.phone}
                onChange={(e) => handleGeneralChange('phone', e.target.value)}
                placeholder="+502 1234-5678"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label flex items-center">
              <FiMapPin className="mr-2" size={16} />
              Dirección Completa *
            </label>
            <input
              type="text"
              className="input"
              value={generalConfig.address}
              onChange={(e) => handleGeneralChange('address', e.target.value)}
              placeholder="Dirección completa de la clínica"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Zona Horaria</label>
              <select
                className="input"
                value={generalConfig.timezone}
                onChange={(e) => handleGeneralChange('timezone', e.target.value)}
              >
                <option value="America/Guatemala">Guatemala (GMT-6)</option>
                <option value="America/Mexico_City">México (GMT-6)</option>
                <option value="America/Costa_Rica">Costa Rica (GMT-6)</option>
                <option value="America/Bogota">Colombia (GMT-5)</option>
                <option value="America/Lima">Perú (GMT-5)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label flex items-center">
                <FiDollarSign className="mr-2" size={16} />
                Moneda
              </label>
              <select
                className="input"
                value={generalConfig.currency}
                onChange={(e) => handleGeneralChange('currency', e.target.value)}
              >
                <option value="GTQ">Quetzal (GTQ)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="MXN">Peso Mexicano (MXN)</option>
                <option value="CRC">Colón (CRC)</option>
                <option value="COP">Peso Colombiano (COP)</option>
                <option value="PEN">Sol (PEN)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold flex items-center">
            <FiImage className="mr-2" />
            Imagen Corporativa
          </h3>
        </div>
        <div className="card-body">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-neutral-100 rounded-lg flex items-center justify-center">
              {generalConfig.logo ? (
                <img src={generalConfig.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <FiImage className="text-neutral-400" size={32} />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-neutral-600 mb-3">
                Sube el logo de tu veterinaria. Se recomienda una imagen cuadrada de al menos 200x200px.
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="logo-upload"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => handleGeneralChange('logo', e.target.result);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label htmlFor="logo-upload" className="btn btn-outline cursor-pointer">
                <FiEdit className="mr-2" size={16} />
                Cambiar Logo
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold flex items-center">
            <FiClock className="mr-2" />
            Horarios de Atención
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {Object.entries(businessConfig.openingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4 p-3 bg-neutral-50 rounded-lg">
                <div className="w-24 font-medium text-neutral-700">
                  {getDayLabel(day)}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!hours.closed}
                    onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-neutral-600">Abierto</span>
                </div>
                {!hours.closed && (
                  <>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      className="input w-32"
                    />
                    <span className="text-neutral-500">a</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      className="input w-32"
                    />
                  </>
                )}
                {hours.closed && (
                  <span className="text-neutral-500 italic">Cerrado</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">Políticas de Citas</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Duración de Cita (minutos)</label>
              <select
                className="input"
                value={businessConfig.appointmentDuration}
                onChange={(e) => handleBusinessChange('appointmentDuration', parseInt(e.target.value))}
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>1 hora</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Máximo días de anticipación</label>
              <input
                type="number"
                className="input"
                min="1"
                max="365"
                value={businessConfig.maxAdvanceBooking}
                onChange={(e) => handleBusinessChange('maxAdvanceBooking', parseInt(e.target.value))}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Política de cancelación (horas)</label>
              <input
                type="number"
                className="input"
                min="1"
                max="72"
                value={businessConfig.cancellationPolicy}
                onChange={(e) => handleBusinessChange('cancellationPolicy', parseInt(e.target.value))}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Teléfono de Emergencias</label>
              <input
                type="tel"
                className="input"
                value={businessConfig.emergencyPhone}
                onChange={(e) => handleBusinessChange('emergencyPhone', e.target.value)}
                placeholder="+502 1234-5679"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Información</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Las citas se pueden agendar hasta {businessConfig.maxAdvanceBooking} días de anticipación</li>
              <li>• Cada cita tiene una duración de {businessConfig.appointmentDuration} minutos</li>
              <li>• Los clientes pueden cancelar hasta {businessConfig.cancellationPolicy} horas antes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold flex items-center">
            <FiShield className="mr-2" />
            Seguridad y Acceso
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">Modo Mantenimiento</h4>
                <p className="text-sm text-neutral-600">Deshabilita el acceso temporal al sistema</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemConfig.maintenanceMode}
                  onChange={(e) => handleSystemChange('maintenanceMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">Permitir Registros</h4>
                <p className="text-sm text-neutral-600">Los usuarios pueden crear nuevas cuentas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemConfig.allowRegistrations}
                  onChange={(e) => handleSystemChange('allowRegistrations', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">Verificación de Email</h4>
                <p className="text-sm text-neutral-600">Requiere verificar email al registrarse</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemConfig.requireEmailVerification}
                  onChange={(e) => handleSystemChange('requireEmailVerification', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="form-group">
              <label className="form-label">Tiempo de sesión (minutos)</label>
              <select
                className="input"
                value={systemConfig.sessionTimeout}
                onChange={(e) => handleSystemChange('sessionTimeout', parseInt(e.target.value))}
              >
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={120}>2 horas</option>
                <option value={480}>8 horas</option>
                <option value={1440}>24 horas</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Máximo intentos de login</label>
              <select
                className="input"
                value={systemConfig.maxLoginAttempts}
                onChange={(e) => handleSystemChange('maxLoginAttempts', parseInt(e.target.value))}
              >
                <option value={3}>3 intentos</option>
                <option value={5}>5 intentos</option>
                <option value={10}>10 intentos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold flex items-center">
            <FiDatabase className="mr-2" />
            Mantenimiento del Sistema
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Frecuencia de Respaldo</label>
              <select
                className="input"
                value={systemConfig.backupFrequency}
                onChange={(e) => handleSystemChange('backupFrequency', e.target.value)}
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Retención de logs (días)</label>
              <input
                type="number"
                className="input"
                min="7"
                max="365"
                value={systemConfig.logRetention}
                onChange={(e) => handleSystemChange('logRetention', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button className="btn btn-outline">
              <FiRefreshCw className="mr-2" size={16} />
              Limpiar Cache
            </button>
            <button className="btn btn-outline">
              <FiDatabase className="mr-2" size={16} />
              Optimizar BD
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold flex items-center">
            <FiBell className="mr-2" />
            Notificaciones del Sistema
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">Recordatorios de Citas</h4>
                <p className="text-sm text-neutral-600">Enviar recordatorios automáticos a los clientes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationConfig.appointmentReminders}
                  onChange={(e) => handleNotificationChange('appointmentReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">Confirmaciones de Pago</h4>
                <p className="text-sm text-neutral-600">Notificar cuando se procesen pagos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationConfig.paymentConfirmations}
                  onChange={(e) => handleNotificationChange('paymentConfirmations', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">Actualizaciones de Órdenes</h4>
                <p className="text-sm text-neutral-600">Notificar cambios de estado en órdenes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationConfig.orderUpdates}
                  onChange={(e) => handleNotificationChange('orderUpdates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">Alertas del Sistema</h4>
                <p className="text-sm text-neutral-600">Notificaciones para administradores</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationConfig.systemAlerts}
                  onChange={(e) => handleNotificationChange('systemAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <div className="form-group">
              <label className="form-label">Recordatorios de citas (horas antes)</label>
              <select
                className="input w-full md:w-48"
                value={notificationConfig.reminderHours}
                onChange={(e) => handleNotificationChange('reminderHours', parseInt(e.target.value))}
              >
                <option value={1}>1 hora antes</option>
                <option value={2}>2 horas antes</option>
                <option value={6}>6 horas antes</option>
                <option value={12}>12 horas antes</option>
                <option value={24}>24 horas antes</option>
                <option value={48}>48 horas antes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold flex items-center">
            <FiMail className="mr-2" />
            Configuración de Email
          </h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Plantilla de Email</label>
            <select
              className="input"
              value={notificationConfig.emailTemplate}
              onChange={(e) => handleNotificationChange('emailTemplate', e.target.value)}
            >
              <option value="classic">Clásica</option>
              <option value="modern">Moderna</option>
              <option value="minimal">Minimalista</option>
            </select>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">Email Marketing</h4>
                <p className="text-sm text-neutral-600">Enviar promociones y noticias</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationConfig.marketingEmails}
                  onChange={(e) => handleNotificationChange('marketingEmails', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <h4 className="font-medium text-neutral-900">SMS (Próximamente)</h4>
                <p className="text-sm text-neutral-600">Notificaciones por mensaje de texto</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer opacity-50">
                <input
                  type="checkbox"
                  checked={notificationConfig.smsNotifications}
                  onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                  className="sr-only peer"
                  disabled
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Configuración del Sistema
          </h1>
          <p className="text-neutral-600 mt-2">
            Administra todas las configuraciones de tu veterinaria
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="btn btn-outline flex items-center"
          >
            <FiRefreshCw className="mr-2" size={16} />
            Restaurar
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary flex items-center"
            disabled={saving}
          >
            <FiSave className="mr-2" size={16} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-neutral-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Icon className="mr-2" size={16} />
              <div className="text-left">
                <div>{tab.label}</div>
                <div className="text-xs text-neutral-500 hidden sm:block">
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'business' && renderBusinessTab()}
        {activeTab === 'system' && renderSystemTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
      </div>
    </div>
  );
};

export default AdminConfigPage;