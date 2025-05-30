// frontend/src/routes/index.tsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingScreen } from '../components/UI/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';

// Lazy loading das páginas - Corrigido para funcionar com export default
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('../pages/auth/ForgotPasswordPage'));

// Componente de rota protegida
interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente de rota pública (redireciona se logado)
const PublicRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Componente principal de rotas
export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Rotas públicas */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } 
        />

        {/* Rotas protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />

        {/* Placeholder para outras rotas protegidas que serão implementadas */}
        <Route 
          path="/condominios/*" 
          element={
            <PrivateRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Página de Condomínios (Em desenvolvimento)</h2>
                <p>Esta funcionalidade será implementada nas próximas fases.</p>
              </div>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/unidades/*" 
          element={
            <PrivateRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Página de Unidades (Em desenvolvimento)</h2>
                <p>Esta funcionalidade será implementada nas próximas fases.</p>
              </div>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/pagamentos/*" 
          element={
            <PrivateRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Página de Pagamentos (Em desenvolvimento)</h2>
                <p>Esta funcionalidade será implementada nas próximas fases.</p>
              </div>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/manutencao/*" 
          element={
            <PrivateRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Página de Manutenção (Em desenvolvimento)</h2>
                <p>Esta funcionalidade será implementada nas próximas fases.</p>
              </div>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/notificacoes/*" 
          element={
            <PrivateRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Página de Notificações (Em desenvolvimento)</h2>
                <p>Esta funcionalidade será implementada nas próximas fases.</p>
              </div>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/perfil" 
          element={
            <PrivateRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Página de Perfil (Em desenvolvimento)</h2>
                <p>Esta funcionalidade será implementada nas próximas fases.</p>
              </div>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/configuracoes" 
          element={
            <PrivateRoute>
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Página de Configurações (Em desenvolvimento)</h2>
                <p>Esta funcionalidade será implementada nas próximas fases.</p>
              </div>
            </PrivateRoute>
          } 
        />

        {/* Rota padrão */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rota 404 */}
        <Route 
          path="*" 
          element={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100vh',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <h1>404 - Página não encontrada</h1>
              <p>A página que você procura não existe.</p>
              <a href="/dashboard" style={{ color: '#3182CE' }}>
                Voltar ao Dashboard
              </a>
            </div>
          } 
        />
      </Routes>
    </Suspense>
  );
};