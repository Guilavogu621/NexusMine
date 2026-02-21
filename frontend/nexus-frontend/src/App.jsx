import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import FloatingChatbot from './components/FloatingChatbot';

/* ── Spinner global (affiché pendant le chargement lazy) ── */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-3">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200/40"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-gray-500 font-medium">Chargement…</p>
      </div>
    </div>
  );
}

/* ── Lazy imports — chaque page = un chunk séparé ── */
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

// Sites
const SitesList = lazy(() => import('./pages/sites').then(m => ({ default: m.SitesList })));
const SiteForm = lazy(() => import('./pages/sites').then(m => ({ default: m.SiteForm })));
const SiteDetail = lazy(() => import('./pages/sites').then(m => ({ default: m.SiteDetail })));
const SitesMap = lazy(() => import('./pages/sites').then(m => ({ default: m.SitesMap })));

// Personnel
const PersonnelList = lazy(() => import('./pages/personnel').then(m => ({ default: m.PersonnelList })));
const PersonnelForm = lazy(() => import('./pages/personnel').then(m => ({ default: m.PersonnelForm })));
const PersonnelDetail = lazy(() => import('./pages/personnel').then(m => ({ default: m.PersonnelDetail })));

// Équipements
const EquipmentList = lazy(() => import('./pages/equipment').then(m => ({ default: m.EquipmentList })));
const EquipmentForm = lazy(() => import('./pages/equipment').then(m => ({ default: m.EquipmentForm })));
const EquipmentDetail = lazy(() => import('./pages/equipment').then(m => ({ default: m.EquipmentDetail })));

// Opérations
const OperationsList = lazy(() => import('./pages/operations').then(m => ({ default: m.OperationsList })));
const OperationsForm = lazy(() => import('./pages/operations').then(m => ({ default: m.OperationsForm })));
const OperationsDetail = lazy(() => import('./pages/operations').then(m => ({ default: m.OperationsDetail })));

// Incidents
const IncidentsList = lazy(() => import('./pages/incidents').then(m => ({ default: m.IncidentsList })));
const IncidentsForm = lazy(() => import('./pages/incidents').then(m => ({ default: m.IncidentsForm })));
const IncidentsDetail = lazy(() => import('./pages/incidents').then(m => ({ default: m.IncidentsDetail })));

// Environnement
const EnvironmentList = lazy(() => import('./pages/environment').then(m => ({ default: m.EnvironmentList })));
const EnvironmentForm = lazy(() => import('./pages/environment').then(m => ({ default: m.EnvironmentForm })));
const EnvironmentDetail = lazy(() => import('./pages/environment').then(m => ({ default: m.EnvironmentDetail })));

// Alertes
const AlertsList = lazy(() => import('./pages/alerts').then(m => ({ default: m.AlertsList })));
const AlertsForm = lazy(() => import('./pages/alerts').then(m => ({ default: m.AlertsForm })));
const AlertsDetail = lazy(() => import('./pages/alerts').then(m => ({ default: m.AlertsDetail })));

// Rapports
const ReportsList = lazy(() => import('./pages/reports').then(m => ({ default: m.ReportsList })));
const ReportsForm = lazy(() => import('./pages/reports').then(m => ({ default: m.ReportsForm })));
const ReportsDetail = lazy(() => import('./pages/reports').then(m => ({ default: m.ReportsDetail })));

// Analytics
const AnalyticsList = lazy(() => import('./pages/analytics').then(m => ({ default: m.AnalyticsList })));
const AnalyticsForm = lazy(() => import('./pages/analytics').then(m => ({ default: m.AnalyticsForm })));
const AnalyticsDetail = lazy(() => import('./pages/analytics').then(m => ({ default: m.AnalyticsDetail })));

// Intelligence (AI)
const IntelligenceDashboard = lazy(() => import('./pages/intelligence').then(m => ({ default: m.IntelligenceDashboard })));

// Stock
const StockList = lazy(() => import('./pages/stock').then(m => ({ default: m.StockList })));
const StockForm = lazy(() => import('./pages/stock').then(m => ({ default: m.StockForm })));
const StockDetail = lazy(() => import('./pages/stock').then(m => ({ default: m.StockDetail })));

// Users
const UsersList = lazy(() => import('./pages/users').then(m => ({ default: m.UsersList })));
const UsersForm = lazy(() => import('./pages/users').then(m => ({ default: m.UsersForm })));
const UsersDetail = lazy(() => import('./pages/users').then(m => ({ default: m.UsersDetail })));

// Audit & Compliance
const AuditDashboard = lazy(() => import('./pages/audit/AuditDashboard'));

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Landing Page - Public */}
      <Route path="/home" element={<><LandingPage /><FloatingChatbot /></>} />
      
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <><Login /><FloatingChatbot /></>}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
      />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Profil et Paramètres */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Sites Miniers */}
        <Route path="/sites" element={<SitesList />} />
        <Route path="/sites/map" element={<SitesMap />} />
        <Route path="/sites/new" element={
          <ProtectedRoute roles={['ADMIN']}>
            <SiteForm />
          </ProtectedRoute>
        } />
        <Route path="/sites/:id" element={<SiteDetail />} />
        <Route path="/sites/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER']}>
            <SiteForm />
          </ProtectedRoute>
        } />
        
        {/* Personnel */}
        <Route path="/personnel" element={<PersonnelList />} />
        <Route path="/personnel/new" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER']}>
            <PersonnelForm />
          </ProtectedRoute>
        } />
        <Route path="/personnel/:id" element={<PersonnelDetail />} />
        <Route path="/personnel/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER']}>
            <PersonnelForm />
          </ProtectedRoute>
        } />
        
        {/* Équipements */}
        <Route path="/equipment" element={<EquipmentList />} />
        <Route path="/equipment/new" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER']}>
            <EquipmentForm />
          </ProtectedRoute>
        } />
        <Route path="/equipment/:id" element={<EquipmentDetail />} />
        <Route path="/equipment/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER', 'TECHNICIEN']}>
            <EquipmentForm />
          </ProtectedRoute>
        } />
        
        {/* Opérations */}
        <Route path="/operations" element={<OperationsList />} />
        <Route path="/operations/new" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER', 'TECHNICIEN']}>
            <OperationsForm />
          </ProtectedRoute>
        } />
        <Route path="/operations/:id" element={<OperationsDetail />} />
        <Route path="/operations/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER', 'TECHNICIEN']}>
            <OperationsForm />
          </ProtectedRoute>
        } />
        
        {/* Incidents */}
        <Route path="/incidents" element={<IncidentsList />} />
        <Route path="/incidents/new" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER', 'TECHNICIEN']}>
            <IncidentsForm />
          </ProtectedRoute>
        } />
        <Route path="/incidents/:id" element={<IncidentsDetail />} />
        <Route path="/incidents/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER']}>
            <IncidentsForm />
          </ProtectedRoute>
        } />
        
        {/* Environnement */}
        <Route path="/environment" element={<EnvironmentList />} />
        <Route path="/environment/new" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER', 'TECHNICIEN']}>
            <EnvironmentForm />
          </ProtectedRoute>
        } />
        <Route path="/environment/:id" element={<EnvironmentDetail />} />
        <Route path="/environment/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER', 'TECHNICIEN']}>
            <EnvironmentForm />
          </ProtectedRoute>
        } />
        
        {/* Alertes */}
        <Route path="/alerts" element={<AlertsList />} />
        <Route path="/alerts/new" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER']}>
            <AlertsForm />
          </ProtectedRoute>
        } />
        <Route path="/alerts/:id" element={<AlertsDetail />} />
        <Route path="/alerts/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER']}>
            <AlertsForm />
          </ProtectedRoute>
        } />
        
        {/* Rapports */}
        <Route path="/reports" element={<ReportsList />} />
        <Route path="/reports/new" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER', 'ANALYST', 'TECHNICIEN']}>
            <ReportsForm />
          </ProtectedRoute>
        } />
        <Route path="/reports/:id" element={<ReportsDetail />} />
        <Route path="/reports/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER', 'ANALYST', 'TECHNICIEN']}>
            <ReportsForm />
          </ProtectedRoute>
        } />

        {/* Stock */}
        <Route path="/stock" element={<StockList />} />
        <Route path="/stock/new" element={
          <ProtectedRoute roles={['ADMIN', 'SITE_MANAGER', 'TECHNICIEN']}>
            <StockForm />
          </ProtectedRoute>
        } />
        <Route path="/stock/:id" element={<StockDetail />} />

        {/* Phase 2 — Maintenance (IA)
        <Route path="/maintenance" element={<MaintenanceList />} />
        <Route path="/maintenance/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <MaintenanceForm />
          </ProtectedRoute>
        } />
        <Route path="/maintenance/:id" element={<MaintenanceDetail />} />
        */}

        {/* Phase 2 — Seuils Environnementaux (IA)
        <Route path="/thresholds" element={<ThresholdsList />} />
        <Route path="/thresholds/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <ThresholdsForm />
          </ProtectedRoute>
        } />
        <Route path="/thresholds/:id" element={<ThresholdsDetail />} />
        <Route path="/thresholds/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <ThresholdsForm />
          </ProtectedRoute>
        } />
        */}

        {/* Phase 2 — Règles d'Alerte (IA)}
        <Route path="/alert-rules" element={<AlertRulesList />} />
        <Route path="/alert-rules/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <AlertRulesForm />
          </ProtectedRoute>
        } />
        <Route path="/alert-rules/:id" element={<AlertRulesDetail />} />
        <Route path="/alert-rules/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <AlertRulesForm />
          </ProtectedRoute>
        } />
        */}

        {/* Phase 2 — Zones de Travail (IA)
        <Route path="/workzones" element={<WorkZonesList />} />
        <Route path="/workzones/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <WorkZonesForm />
          </ProtectedRoute>
        } />
        <Route path="/workzones/:id" element={<WorkZonesDetail />} />
        <Route path="/workzones/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <WorkZonesForm />
          </ProtectedRoute>
        } />
        */}

        {/* Phase 2 — Rotations / Shifts (IA)
        <Route path="/shifts" element={<ShiftsList />} />
        <Route path="/shifts/new" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <ShiftsForm />
          </ProtectedRoute>
        } />
        <Route path="/shifts/:id" element={<ShiftsDetail />} />
        <Route path="/shifts/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
            <ShiftsForm />
          </ProtectedRoute>
        } />
        */}
        
        {/* 🧠 Intelligence (AI Dashboard) */}
        <Route path="/intelligence" element={<IntelligenceDashboard />} />
        
        {/* Indicateurs (Analytics) */}
        <Route path="/analytics" element={<AnalyticsList />} />
        <Route path="/analytics/new" element={
          <ProtectedRoute roles={['ADMIN', 'ANALYST']}>
            <AnalyticsForm />
          </ProtectedRoute>
        } />
        <Route path="/analytics/:id" element={<AnalyticsDetail />} />
        <Route path="/analytics/:id/edit" element={
          <ProtectedRoute roles={['ADMIN', 'ANALYST']}>
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

        {/* Audit & Compliance (MMG + ADMIN) */}
        <Route path="/audit" element={
          <ProtectedRoute roles={['MMG', 'ADMIN']}>
            <AuditDashboard />
          </ProtectedRoute>
        } />
      </Route>

      {/* Redirect root to landing or dashboard */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/home" replace />}
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900">404</h1>
              <p className="mt-4 text-xl text-gray-600">Page non trouvée</p>
              <a href="/home" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Retour à l&apos;accueil
              </a>
            </div>
          </div>
        }
      />
    </Routes>
    </Suspense>
  );
}

export default App;
