import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser, FiHeart, FiLoader } from 'react-icons/fi';
import Modal, { ModalBody, ModalFooter } from '../common/Modal';
import petService from '../../services/petService';
import appointmentService from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AppointmentBooking = ({ isOpen, onClose, onSuccess, selectedPet = null }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    petId: selectedPet?.id || '',
    appointmentType: '',
    preferredDate: '',
    preferredTime: '',
    veterinarianId: '',
    symptoms: '',
    notes: ''
  });
  const [userPets, setUserPets] = useState([]);
  const [availableVets, setAvailableVets] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserPets();
      fetchAppointmentTypes();
      fetchAvailableVets();
    }
  }, [isOpen]);

  // Reload veterinarians when date changes
  useEffect(() => {
    if (isOpen && formData.preferredDate) {
      fetchAvailableVets();
    }
  }, [formData.preferredDate]);

  const fetchUserPets = async () => {
    try {
      setLoading(true);
      const response = await petService.getUserPets();
      if (response.success) {
        setUserPets(response.data.pets || []);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast.error('Error al cargar las mascotas');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentTypes = async () => {
    try {
      const response = await appointmentService.getAppointmentTypes();
      if (response.success) {
        setAppointmentTypes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching appointment types:', error);
      toast.error('Error al cargar los tipos de cita');
    }
  };

  const fetchAvailableVets = async () => {
    try {
      const params = {};
      if (formData.preferredDate) {
        // Ensure date is in YYYY-MM-DD format
        params.date = formData.preferredDate;
      }
      
      const response = await appointmentService.getAvailableVeterinarians(params);
      if (response.success) {
        setAvailableVets(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching vets:', error);
      toast.error('Error al cargar los veterinarios');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Construct date properly
      const appointmentDateTime = new Date(`${formData.preferredDate}T${formData.preferredTime}:00`);
      
      const reason = formData.symptoms?.trim() || getSelectedType()?.label || 'Consulta general';
      
      const appointmentData = {
        petId: formData.petId,
        date: appointmentDateTime.toISOString(),
        reason: reason,
        notes: formData.notes?.trim() || '',
        veterinarianId: formData.veterinarianId || null
      };

      console.log('Creating appointment:', appointmentData);
      
      const response = await appointmentService.createAppointment(appointmentData);
      
      if (response.success) {
        toast.success('Cita agendada exitosamente');
        onClose();
        if (onSuccess) onSuccess();
        
        // Reset form
        setStep(1);
        setFormData({
          petId: selectedPet?.id || '',
          appointmentType: '',
          preferredDate: '',
          preferredTime: '',
          veterinarianId: '',
          symptoms: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error(error.response?.data?.error?.message || 'Error al agendar la cita');
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedType = () => appointmentTypes.find(type => type.value === formData.appointmentType);
  const getSelectedVet = () => availableVets.find(vet => vet.id === formData.veterinarianId);
  const getSelectedPet = () => selectedPet || userPets.find(pet => pet.id === formData.petId);

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.petId && formData.appointmentType;
      case 2:
        return formData.preferredDate && formData.preferredTime && formData.veterinarianId;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Selecciona la mascota y tipo de cita
        </h3>
      </div>

      {!selectedPet && (
        <div className="form-group">
          <label className="form-label">Mascota *</label>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <FiLoader className="animate-spin text-primary-600" size={20} />
              <span className="ml-2 text-neutral-600">Cargando mascotas...</span>
            </div>
          ) : userPets.length > 0 ? (
            <select 
              className="input"
              value={formData.petId}
              onChange={(e) => handleInputChange('petId', e.target.value)}
            >
              <option value="">Seleccionar mascota</option>
              {userPets.map(pet => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} - {pet.species} {pet.breed ? `(${pet.breed})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span className="font-medium text-yellow-800">No tienes mascotas registradas</span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Necesitas registrar al menos una mascota antes de agendar una cita.
              </p>
              <button
                onClick={() => {
                  onClose();
                  // Redirect to pets page
                  window.location.href = '/mascotas';
                }}
                className="btn btn-sm btn-primary"
              >
                Registrar Mascota
              </button>
            </div>
          )}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Tipo de cita *</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {appointmentTypes.map(type => (
            <div
              key={type.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.appointmentType === type.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              onClick={() => handleInputChange('appointmentType', type.value)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-neutral-900">{type.label}</h4>
                <span className="text-primary-600 font-semibold">Q{type.price}</span>
              </div>
              <p className="text-sm text-neutral-600">Duración: {type.duration}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Selecciona fecha, hora y veterinario
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Fecha preferida *</label>
          <input
            type="date"
            className="input"
            value={formData.preferredDate}
            onChange={(e) => handleInputChange('preferredDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Hora preferida *</label>
          <select
            className="input"
            value={formData.preferredTime}
            onChange={(e) => handleInputChange('preferredTime', e.target.value)}
          >
            <option value="">Seleccionar hora</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Veterinario *</label>
        <div className="space-y-3">
          {availableVets.map(vet => (
            <div
              key={vet.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.veterinarianId === vet.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              onClick={() => handleInputChange('veterinarianId', vet.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-900">{vet.name}</h4>
                  <p className="text-sm text-neutral-600">{vet.specialty || 'Medicina General'}</p>
                  {vet.experience && (
                    <p className="text-xs text-neutral-500">{vet.experience} años de experiencia</p>
                  )}
                  {formData.preferredDate && vet.availableSlots !== undefined && (
                    <p className={`text-xs mt-1 ${vet.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {vet.isAvailable ? `${vet.availableSlots} espacios disponibles` : 'No disponible'}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center text-yellow-400 mb-1">
                    <span className="mr-1">⭐</span>
                    <span className="text-sm text-neutral-600">{vet.rating || '4.5'}</span>
                  </div>
                  {!vet.isAvailable && formData.preferredDate && (
                    <span className="text-xs text-red-600 font-medium">Ocupado</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Información adicional y confirmación
        </h3>
      </div>

      <div className="form-group">
        <label className="form-label">Síntomas o motivo de la consulta</label>
        <textarea
          className="input min-h-[100px] resize-none"
          placeholder="Describe los síntomas o el motivo de la cita..."
          value={formData.symptoms}
          onChange={(e) => handleInputChange('symptoms', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Notas adicionales</label>
        <textarea
          className="input min-h-[80px] resize-none"
          placeholder="Información adicional que el veterinario deba conocer..."
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
        />
      </div>

      <div className="bg-neutral-50 p-4 rounded-lg">
        <h4 className="font-semibold text-neutral-900 mb-3">Resumen de la cita</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Mascota:</span>
            <span className="font-medium">{getSelectedPet()?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Tipo de cita:</span>
            <span className="font-medium">{getSelectedType()?.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Fecha:</span>
            <span className="font-medium">{formData.preferredDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Hora:</span>
            <span className="font-medium">{formData.preferredTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Veterinario:</span>
            <span className="font-medium">{getSelectedVet()?.name}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-neutral-200">
            <span className="text-neutral-600">Costo:</span>
            <span className="font-semibold text-primary-600">Q{getSelectedType()?.price}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Nueva Cita"
      size="lg"
    >
      <ModalBody>
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stepNumber === step
                  ? 'bg-primary-600 text-white'
                  : stepNumber < step
                  ? 'bg-green-500 text-white'
                  : 'bg-neutral-200 text-neutral-500'
              }`}>
                {stepNumber < step ? '✓' : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  stepNumber < step ? 'bg-green-500' : 'bg-neutral-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ModalBody>

      <ModalFooter>
        <div className="flex justify-between w-full">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="btn btn-outline"
          >
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </button>
          
          <button
            onClick={step === 3 ? handleSubmit : handleNext}
            className={`btn ${isStepValid() && !submitting ? 'btn-primary' : 'btn-outline opacity-50 cursor-not-allowed'} flex items-center`}
            disabled={!isStepValid() || submitting}
          >
            {submitting ? (
              <>
                <FiLoader className="animate-spin mr-2" size={16} />
                Agendando...
              </>
            ) : (
              step === 3 ? 'Confirmar Cita' : 'Siguiente'
            )}
          </button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default AppointmentBooking;