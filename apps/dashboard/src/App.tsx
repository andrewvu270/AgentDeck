import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import AgentsPage from './pages/AgentsPage';
import ExecutionsPage from './pages/ExecutionsPage';
import SettingsPage from './pages/SettingsPage';
import WorkspacePage from './pages/WorkspacePage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-text-secondary">Loading...</div>
    </div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={
              isLoading ? (
                <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                  <div className="text-text-secondary">Loading...</div>
                </div>
              ) : isAuthenticated ? (
                <Navigate to="/app/agents" />
              ) : (
                <LandingPage />
              )
            } 
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Dashboard routes */}
          <Route
            path="/app/*"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="agents" replace />} />
                    <Route path="agents" element={<AgentsPage />} />
                    <Route path="workspace" element={<WorkspacePage />} />
                    <Route path="executions" element={<ExecutionsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Routes>
                </DashboardLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a24',
            color: '#ffffff',
            border: '1px solid #2a2a35',
          },
        }}
      />
    </>
  );
}

export default App;
