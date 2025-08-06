import React, { useState } from 'react';
import { FiSave, FiFileText, FiCalendar, FiUser, FiHeart } from 'react-icons/fi';

const DiagnosisForm = ({ appointment, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    symptoms: '',
    examination: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    recommendations: '',
    followUpDate: '',
    notes: '',
    status: 'PENDING'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const diagnosisData = {
      ...formData,
      appointmentId: appointment?.id,
      petId: appointment?.pet?.id,
      date: new Date().toISOString()
    };
    onSave(diagnosisData);
  };

  return (
    <div className="space-y-6">
      {/* Appointment Info */}
      {appointment && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="card-body">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <FiCalendar className="mr-2" size={16} />
              Información de la Cita
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Mascota:</span>
                <span className="ml-2 text-blue-900">
                  {appointment.pet?.name} ({appointment.pet?.species})
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Propietario:</span>
                <span className="ml-2 text-blue-900">{appointment.pet?.owner}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Tipo de cita:</span>
                <span className="ml-2 text-blue-900">{appointment.type}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Fecha:</span>
                <span className="ml-2 text-blue-900">
                  {new Date(appointment.scheduledDate).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
            {appointment.notes && (
              <div className="mt-3">
                <span className="font-medium text-blue-700">Motivo de consulta:</span>
                <p className="mt-1 text-blue-900">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Diagnosis Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Symptoms */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-neutral-900 flex items-center">
              <FiHeart className="mr-2 text-red-500" size={16} />
              Síntomas Observados
            </h3>
          </div>
          <div className="card-body">
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Describe los síntomas reportados por el propietario y observados durante la consulta..."
              value={formData.symptoms}
              onChange={(e) => handleInputChange('symptoms', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Physical Examination */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-neutral-900 flex items-center">
              <FiUser className="mr-2 text-blue-500" size={16} />
              Examen Físico
            </h3>
          </div>
          <div className="card-body">
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Registra los hallazgos del examen físico: peso, temperatura, frecuencia cardíaca, respiratoria, etc..."
              value={formData.examination}
              onChange={(e) => handleInputChange('examination', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Diagnosis */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-neutral-900 flex items-center">
              <FiFileText className="mr-2 text-green-500" size={16} />
              Diagnóstico
            </h3>
          </div>
          <div className="card-body">
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Diagnóstico principal y diagnósticos diferenciales..."
              value={formData.diagnosis}
              onChange={(e) => handleInputChange('diagnosis', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Treatment */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-neutral-900">Plan de Tratamiento</h3>
          </div>
          <div className="card-body">
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Describe el plan de tratamiento, procedimientos realizados, cirugías, etc..."
              value={formData.treatment}
              onChange={(e) => handleInputChange('treatment', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Medications */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-neutral-900">Medicamentos Prescritos</h3>
          </div>
          <div className="card-body">
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Lista de medicamentos con dosis, frecuencia y duración del tratamiento..."
              value={formData.medications}
              onChange={(e) => handleInputChange('medications', e.target.value)}
            />
          </div>
        </div>

        {/* Recommendations */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-neutral-900">Recomendaciones</h3>
          </div>
          <div className="card-body">
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Cuidados en casa, dieta, ejercicio, precauciones, etc..."
              value={formData.recommendations}
              onChange={(e) => handleInputChange('recommendations', e.target.value)}
            />
          </div>
        </div>

        {/* Follow-up and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Fecha de Seguimiento</label>
            <input
              type="date"
              className="input"
              value={formData.followUpDate}
              onChange={(e) => handleInputChange('followUpDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Fecha recomendada para la próxima consulta
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Notas Adicionales</label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="Información adicional, observaciones especiales..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>
        </div>

        {/* Status Selection */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-neutral-900 flex items-center">
              <FiFileText className="mr-2 text-green-500" size={16} />
              Estado del Diagnóstico
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="PENDING"
                  checked={formData.status === 'PENDING'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-4 h-4 text-yellow-600 border-neutral-300 focus:ring-yellow-500"
                />
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pendiente
                  </span>
                  <span className="text-sm text-neutral-600">Requiere revisión</span>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="REVIEWED"
                  checked={formData.status === 'REVIEWED'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-4 h-4 text-blue-600 border-neutral-300 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Revisado
                  </span>
                  <span className="text-sm text-neutral-600">En seguimiento</span>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="COMPLETED"
                  checked={formData.status === 'COMPLETED'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-4 h-4 text-green-600 border-neutral-300 focus:ring-green-500"
                />
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completado
                  </span>
                  <span className="text-sm text-neutral-600">Caso cerrado</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
          >
            Cancelar
          </button>
          
          <div className="flex space-x-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => console.log('Guardando como borrador')}
            >
              Guardar Borrador
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center"
            >
              <FiSave className="mr-2" size={16} />
              Completar Diagnóstico
            </button>
          </div>
        </div>
      </form>

      {/* Quick Templates */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-neutral-900">Plantillas Rápidas</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              className="btn btn-outline btn-sm text-left"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  symptoms: 'Consulta de rutina para chequeo general',
                  examination: 'Examen físico normal, signos vitales estables',
                  diagnosis: 'Animal sano',
                  treatment: 'Ningún tratamiento requerido',
                  recommendations: 'Continuar con dieta actual y ejercicio regular'
                }));
              }}
            >
              Chequeo Rutina
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm text-left"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  symptoms: 'Aplicación de vacuna según calendario',
                  examination: 'Examen físico previo a vacunación normal',
                  diagnosis: 'Animal apto para vacunación',
                  treatment: 'Vacuna aplicada',
                  recommendations: 'Observar posibles reacciones las próximas 24-48 horas'
                }));
              }}
            >
              Vacunación
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm text-left"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  symptoms: 'Síntomas gastrointestinales',
                  examination: 'Abdomen sensible, deshidratación leve',
                  diagnosis: 'Gastroenteritis aguda',
                  treatment: 'Fluidoterapia, dieta blanda',
                  recommendations: 'Ayuno 12 horas, reintroducir alimento gradualmente'
                }));
              }}
            >
              Gastroenteritis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisForm;