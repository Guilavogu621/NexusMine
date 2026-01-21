import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { SitesList, SiteForm, SiteDetail } from './pages/sites';
import { PersonnelList, PersonnelForm, PersonnelDetail } from './pages/personnel';
import { EquipmentList, EquipmentForm, EquipmentDetail } from './pages/equipment';
import { OperationsList, OperationsForm, OperationsDetail } from './pages/operations';
import { IncidentsList, IncidentsForm, IncidentsDetail } from './pages/incidents';
import { EnvironmentList, EnvironmentForm, EnvironmentDetail } from './pages/environment';
import { AlertsList, AlertsForm, AlertsDetail } from './pages/alerts';
import { ReportsList, ReportsForm, ReportsDetail } from './pages/reports';
import { AnalyticsList, AnalyticsForm, AnalyticsDetail } from './pages/analytics';
import { UsersList, UsersForm, UsersDetail } from './pages/users';

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        
        {/* Sites Miniers */}
        <Route path="/sites" element={<SitesList />} />
        <Route path="/sites/new" element={
          <ProtectedRoute roles={['ADMIN']}>
            <SiteForm />
          </ProtectedRoute>
        } />
        <Route path="/sites/:id" element={<SiteDetail />} />
        <Route path="/sites/:id/edit" element={
          <ProtectedRoute roles={['ADMIN']}>
            <SiteForm />
          </ProtectedRoute>
        } />
        
        {/* Personnel */}
        <Route path="/personnel" element={<PersonnelList />} />
        <Route path="/personnel/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <PersonnelForm />
          </ProtectedRoute>
        } />
        <Route path="/personnel/:id" element={<PersonnelDetail />} />
        <Route path="/personnel/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <PersonnelForm />
          </ProtectedRoute>
        } />
        
        {/* Équipements */}
        <Route path="/equipment" element={<EquipmentList />} />
        <Route path="/equipment/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <EquipmentForm />
          </ProtectedRoute>
        } />
        <Route path="/equipment/:id" element={<EquipmentDetail />} />
        <Route path="/equipment/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <EquipmentForm />
          </ProtectedRoute>
        } />
        
        {/* Opérations */}
        <Route path="/operations" element={<OperationsList />} />
        <Route path="/operations/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <OperationsForm />
          </ProtectedRoute>
        } />
        <Route path="/operations/:id" element={<OperationsDetail />} />
        <Route path="/operations/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <OperationsForm />
          </ProtectedRoute>
        } />
        
        {/* Incidents */}
        <Route path="/incidents" element={<IncidentsList />} />
        <Route path="/incidents/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <IncidentsForm />
          </ProtectedRoute>
        } />
        <Route path="/incidents/:id" element={<IncidentsDetail />} />
        <Route path="/incidents/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <IncidentsForm />
          </ProtectedRoute>
        } />
        
        {/* Environnement */}
        <Route path="/environment" element={<EnvironmentList />} />
        <Route path="/environment/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <EnvironmentForm />
          </ProtectedRoute>
        } />
        <Route path="/environment/:id" element={<EnvironmentDetail />} />
        <Route path="/environment/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <EnvironmentForm />
          </ProtectedRoute>
        } />
        
        {/* Alertes */}
        <Route path="/alerts" element={<AlertsList />} />
        <Route path="/alerts/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <AlertsForm />
          </ProtectedRoute>
        } />
        <Route path="/alerts/:id" element={<AlertsDetail />} />
        <Route path="/alerts/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <AlertsForm />
          </ProtectedRoute>
        } />
        
        {/* Rapports */}
        <Route path="/reports" element={<ReportsList />} />
        <Route path="/reports/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR', 'ANALYST']}>
            <ReportsForm />
          </ProtectedRoute>
        } />
        <Route path="/reports/:id" element={<ReportsDetail />} />
        <Route path="/reports/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR', 'ANALYST']}>
            <ReportsForm />
          </ProtectedRoute>
        } />
        
        {/* Indicateurs (Analytics) */}
        <Route path="/analytics" element={<AnalyticsList />} />
        <Route path="/analytics/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR', 'ANALYST']}>
            <AnalyticsForm />
          </ProtectedRoute>
        } />
        <Route path="/analytics/:id" element={<AnalyticsDetail />} />
        <Route path="/analytics/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR', 'ANALYST']}>
            <AnalyticsForm />
          </ProtectedRoute>
        } />
        
        {/* Utilisateurs (ADMIN only) */}
        <Route path="/users" element={
          <ProtectedRoute roles={['ADMIN']}>
            <UsersList />
          </ProtectedRoute>
        } />
        <Route path="/users/new" element={
          <ProtectedRoute roles={['ADMIN']}>
            <UsersForm />
          </ProtectedRoute>
        } />
        <Route path="/users/:id" element={
          <ProtectedRoute roles={['ADMIN']}>
            <UsersDetail />
          </ProtectedRoute>
        } />
        <Route path="/users/:id/edit" element={
          <ProtectedRoute roles={['ADMIN']}>
            <UsersForm />
          </ProtectedRoute>
        } />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">404</h1>
              <p className="mt-2 text-gray-600">Page non trouvée</p>
              <a href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
                Retour à l&apos;accueil
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
