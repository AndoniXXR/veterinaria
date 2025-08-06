import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import Modal, { ModalBody, ModalFooter } from '../common/Modal';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    roleStats: { USER: 0, VETERINARIAN: 0, ADMIN: 0 },
    recentUsers: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await userService.getAllUsers(params);
      if (response.success) {
        setUsers(response.data.users);
      } else {
        toast.error('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const response = await userService.getUserStats();
      if (response.success) {
        setUserStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Load data on component mount and when filters change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, searchTerm ? 500 : 0); // 500ms debounce for search, immediate for other changes

    return () => clearTimeout(timeoutId);
  }, [roleFilter, searchTerm]);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const roleOptions = [
    { value: 'all', label: 'Todos los roles', count: userStats.totalUsers },
    { value: 'USER', label: 'Usuarios', count: userStats.roleStats.USER },
    { value: 'VETERINARIAN', label: 'Veterinarios', count: userStats.roleStats.VETERINARIAN },
    { value: 'ADMIN', label: 'Administradores', count: userStats.roleStats.ADMIN }
  ];

  // Since filtering is now done on backend, filteredUsers is just users
  const filteredUsers = users;

  const getRoleColor = (role) => {
    const colors = {
      'USER': 'bg-blue-100 text-blue-800',
      'VETERINARIAN': 'bg-green-100 text-green-800',
      'ADMIN': 'bg-purple-100 text-purple-800'
    };
    return colors[role] || 'bg-neutral-100 text-neutral-800';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'USER': 'Usuario',
      'VETERINARIAN': 'Veterinario',
      'ADMIN': 'Administrador'
    };
    return labels[role] || role;
  };

  const getStatusColor = (user) => {
    // User is active by default, but may have isActive field
    const isActive = user.isActive !== undefined ? user.isActive : true;
    return isActive ? 'text-green-600' : 'text-red-600';
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.name}?`)) {
      console.log('Deleting user:', user.id);
    }
  };

  const closeModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) {
      return 'Nunca';
    }
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return `Hace ${Math.floor(diffInHours / 24)} días`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Gestión de Usuarios
          </h2>
          <p className="text-neutral-600">
            Administra usuarios, veterinarios y permisos del sistema.
          </p>
        </div>
        <button
          onClick={handleAddUser}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" size={16} />
          Nuevo Usuario
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Role Filter */}
        <div className="flex flex-wrap gap-2">
          {roleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRoleFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                roleFilter === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {option.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                roleFilter === option.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-200 text-neutral-600'
              }`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-neutral-600">Cargando usuarios...</span>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="card">
              <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiUser className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {user.name}
                      </h3>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Editar usuario"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar usuario"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <FiMail size={14} />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <FiPhone size={14} />
                    <span>{user.phone}</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Estado:</span>
                    <span className={`font-medium ${getStatusColor(user)}`}>
                      {(user.isActive !== undefined ? user.isActive : true) ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Registro:</span>
                    <span className="text-neutral-900">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Último acceso:</span>
                    <span className="text-neutral-900">{formatLastLogin(user.lastLogin)}</span>
                  </div>
                  
                  {/* Role-specific info */}
                  {user.role === 'USER' && user.petsCount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Mascotas:</span>
                      <span className="text-neutral-900">{user.petsCount}</span>
                    </div>
                  )}
                  
                  {user.role === 'VETERINARIAN' && user.specialization && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Especialidad:</span>
                      <span className="text-neutral-900">{user.specialization}</span>
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      (user.isActive !== undefined ? user.isActive : true) ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-neutral-500">
                      {(user.isActive !== undefined ? user.isActive : true) ? 'Usuario activo' : 'Usuario inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-8xl mb-6">👥</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">
            No se encontraron usuarios
          </h3>
          <p className="text-neutral-600 mb-8">
            {searchTerm ? 'Intenta ajustar los términos de búsqueda.' : 'Aún no hay usuarios registrados.'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddUser}
              className="btn btn-primary flex items-center mx-auto"
            >
              <FiPlus className="mr-2" size={16} />
              Crear Primer Usuario
            </button>
          )}
        </div>
      )}

      {/* User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={closeModal}
        title={selectedUser ? `Editar ${selectedUser.name}` : 'Nuevo Usuario'}
        size="md"
      >
        <ModalBody>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Nombre completo"
                  defaultValue={selectedUser?.name}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="input"
                  placeholder="email@ejemplo.com"
                  defaultValue={selectedUser?.email}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+1 234 567 8900"
                  defaultValue={selectedUser?.phone}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rol *</label>
                <select className="input" defaultValue={selectedUser?.role || 'USER'}>
                  <option value="USER">Usuario</option>
                  <option value="VETERINARIAN">Veterinario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Estado</label>
              <select className="input" defaultValue={selectedUser?.status || 'ACTIVE'}>
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>

            {!selectedUser && (
              <div className="form-group">
                <label className="form-label">Contraseña *</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Contraseña segura"
                />
              </div>
            )}
          </form>
        </ModalBody>
        
        <ModalFooter>
          <button onClick={closeModal} className="btn btn-outline">
            Cancelar
          </button>
          <button className="btn btn-primary">
            {selectedUser ? 'Actualizar' : 'Crear'} Usuario
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default UserManagement;