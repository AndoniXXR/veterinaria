import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  FiDollarSign,
  FiUsers,
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiDownload,
  FiFilter,
  FiBarChart,
  FiPieChart,
  FiActivity,
  FiHeart,
  FiShoppingCart,
  FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import reportsService from '../services/reportsService';

const AdminReportsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState({
    overview: null,
    financial: null,
    clients: null,
    operational: null,
    clinical: null,
    services: null
  });

  // Cargar datos del backend
  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getAllReportsData(dateRange);
      setReportsData(data);
    } catch (error) {
      console.error('Error loading reports data:', error);
      toast.error('Error al cargar los datos de reportes');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar componente y cuando cambie el rango de fechas
  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: FiBarChart },
    { id: 'financial', label: 'Financiero', icon: FiDollarSign },
    { id: 'clients', label: 'Clientes', icon: FiUsers },
    { id: 'operations', label: 'Operacional', icon: FiActivity },
    { id: 'clinical', label: 'Clínico', icon: FiHeart }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const handleExport = async (format = 'PDF') => {
    try {
      await reportsService.exportReports(activeTab, format.toLowerCase(), dateRange);
      toast.success(`Reporte ${activeTab} exportado exitosamente`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error al exportar el reporte');
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const isPositive = change >= 0;
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600'
    };

    return (
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-neutral-900">{value}</p>
              {change !== undefined && (
                <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                  <span className="ml-1">{Math.abs(change)}%</span>
                  <span className="text-neutral-500 ml-1">vs mes anterior</span>
                </div>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
              <Icon size={24} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOverviewTab = () => {
    if (!reportsData.overview) return <div>Cargando datos...</div>;
    
    return (
      <div className="space-y-6">
        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Ingresos Totales"
            value={formatCurrency(reportsData.overview.revenue?.total || 0)}
            change={reportsData.overview.revenue?.change || 0}
            icon={FiDollarSign}
            color="green"
          />
          <StatCard
            title="Clientes Activos"
            value={reportsData.overview.clients?.active || 0}
            change={reportsData.overview.clients?.change || 0}
            icon={FiUsers}
            color="blue"
          />
          <StatCard
            title="Citas Completadas"
            value={reportsData.overview.appointments?.completed || 0}
            change={reportsData.overview.appointments?.change || 0}
            icon={FiCalendar}
            color="purple"
          />
          <StatCard
            title="Utilización"
            value={formatPercent(reportsData.overview.utilization?.percentage || 0)}
            change={reportsData.overview.utilization?.change || 0}
            icon={FiActivity}
            color="yellow"
          />
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ingresos mensuales */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Ingresos vs Gastos (6 meses)</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={reportsData.financial?.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Ingresos"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Gastos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribución de servicios */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Distribución de Servicios</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportsData.services || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(reportsData.services || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Citas por día */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Citas e Ingresos por Día de la Semana</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportsData.operational?.dailyAppointments || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="appointments" fill="#3b82f6" name="Citas" />
                <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderFinancialTab = () => {
    if (!reportsData.financial) return <div>Cargando datos financieros...</div>;

    return (
      <div className="space-y-6">
        {/* KPIs financieros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Ingresos Este Mes"
            value={formatCurrency(reportsData.overview?.revenue?.total || 0)}
            change={reportsData.overview?.revenue?.change || 0}
            icon={FiDollarSign}
            color="green"
          />
          <StatCard
            title="Ticket Promedio"
            value={formatCurrency(reportsData.financial?.avgTransaction || 0)}
            change={-2.3}
            icon={FiShoppingCart}
            color="blue"
          />
          <StatCard
            title="Margen de Ganancia"
            value="52.3%"
            change={3.1}
            icon={FiTrendingUp}
            color="purple"
          />
        </div>

        {/* Productos más vendidos */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Top Productos Más Vendidos</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {(reportsData.financial?.topProducts || []).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">{product.name}</h4>
                      <p className="text-sm text-neutral-600">{product.sales} unidades vendidas</p>
                      <p className="text-sm text-neutral-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900">{formatCurrency(product.revenue)}</p>
                    <p className="text-sm text-neutral-600">
                      {formatCurrency(product.revenue / product.sales)} por unidad
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tendencia de ingresos detallada */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Análisis Financiero Detallado</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={reportsData.financial?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  name="Ingresos"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                  name="Gastos"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderClientsTab = () => {
    if (!reportsData.clients) return <div>Cargando datos de clientes...</div>;

    return (
      <div className="space-y-6">
        {/* KPIs de clientes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Clientes"
            value={reportsData.clients.total || 0}
            change={4.2}
            icon={FiUsers}
            color="blue"
          />
          <StatCard
            title="Clientes Nuevos"
            value={reportsData.clients.newClients || 0}
            change={12.8}
            icon={FiTrendingUp}
            color="green"
          />
          <StatCard
            title="Retención"
            value={formatPercent(reportsData.clients.retentionRate || 0)}
            change={-1.5}
            icon={FiHeart}
            color="purple"
          />
          <StatCard
            title="Clientes Activos"
            value={reportsData.clients.activeClients || 0}
            change={6.7}
            icon={FiActivity}
            color="yellow"
          />
        </div>

        {/* Análisis de retención */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Análisis de Retención de Clientes</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {reportsData.clients.total || 0}
                </div>
                <div className="text-sm text-blue-800">Total de Clientes</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {reportsData.clients.activeClients || 0}
                </div>
                <div className="text-sm text-green-800">Clientes Activos</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatPercent(reportsData.clients.retentionRate || 0)}
                </div>
                <div className="text-sm text-purple-800">Tasa de Retención</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOperationsTab = () => {
    if (!reportsData.operational) return <div>Cargando datos operacionales...</div>;

    return (
      <div className="space-y-6">
        {/* KPIs operacionales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Citas Totales"
            value={reportsData.operational.appointments?.total || 0}
            change={7.3}
            icon={FiCalendar}
            color="blue"
          />
          <StatCard
            title="Completadas"
            value={reportsData.operational.appointments?.completed || 0}
            change={5.1}
            icon={FiActivity}
            color="green"
          />
          <StatCard
            title="Canceladas"
            value={reportsData.operational.appointments?.cancelled || 0}
            change={-15.2}
            icon={FiTrendingDown}
            color="yellow"
          />
          <StatCard
            title="Pendientes"
            value={reportsData.operational.appointments?.pending || 0}
            change={-8.7}
            icon={FiClock}
            color="purple"
          />
        </div>

        {/* Utilización */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Utilización de la Agenda</h3>
          </div>
          <div className="card-body">
            <div className="text-center p-8">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {formatPercent(reportsData.operational.appointments?.utilization || 0)}
              </div>
              <div className="text-neutral-600">Utilización de Citas</div>
              <div className="mt-4 text-sm text-neutral-500">
                {reportsData.operational.appointments?.completed || 0} de {reportsData.operational.appointments?.total || 0} citas completadas
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderClinicalTab = () => {
    if (!reportsData.clinical) return <div>Cargando datos clínicos...</div>;

    return (
      <div className="space-y-6">
        {/* Diagnósticos más frecuentes */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Diagnósticos Más Frecuentes</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {(reportsData.clinical.topDiagnoses || []).map((diagnosis, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">{diagnosis.diagnosis}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900">{diagnosis.count} casos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribución por especies */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Distribución por Especies</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(reportsData.clinical.speciesDistribution || []).map((species, index) => (
                <div key={index} className="text-center p-4 bg-neutral-50 rounded-lg">
                  <div className="text-2xl font-bold text-neutral-900 mb-1">
                    {species.count}
                  </div>
                  <div className="text-sm text-neutral-600 capitalize">
                    {species.species}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Reportes y Análisis
          </h1>
          <p className="text-neutral-600 mt-2">
            Insights detallados sobre el rendimiento de tu veterinaria
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input w-40"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 3 meses</option>
            <option value="12m">Último año</option>
          </select>

          {/* Export Button */}
          <button
            onClick={() => handleExport('PDF')}
            className="btn btn-outline flex items-center"
          >
            <FiDownload className="mr-2" size={16} />
            Exportar
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
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-4 text-neutral-600 text-lg">Cargando reportes...</span>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'financial' && renderFinancialTab()}
            {activeTab === 'clients' && renderClientsTab()}
            {activeTab === 'operations' && renderOperationsTab()}
            {activeTab === 'clinical' && renderClinicalTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;