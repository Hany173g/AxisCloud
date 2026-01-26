import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { lazy, Suspense } from 'react'

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const CreateMonitorPage = lazy(() => import('./pages/CreateMonitorPage').then(m => ({ default: m.CreateMonitorPage })))
const MonitorsPage = lazy(() => import('./pages/MonitorsPage').then(m => ({ default: m.MonitorsPage })))
const MonitorDetailsPage = lazy(() => import('./pages/MonitorDetailsPage').then(m => ({ default: m.MonitorDetailsPage })))
const PaymentUpgradePage = lazy(() => import('./pages/PaymentUpgradePage').then(m => ({ default: m.PaymentUpgradePage })))
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage').then(m => ({ default: m.PaymentSuccessPage })))
const PaymentCancelPage = lazy(() => import('./pages/PaymentCancelPage').then(m => ({ default: m.PaymentCancelPage })))

import { getAuth } from './lib/auth'

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}

function App() {
  const { token } = getAuth()

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/monitors" element={<MonitorsPage />} />
          <Route path="/monitors/:slug" element={<MonitorDetailsPage />} />
          <Route path="/monitors/new" element={<CreateMonitorPage />} />
          <Route path="/payment/upgrade" element={<PaymentUpgradePage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel_url" element={<PaymentCancelPage />} />
          <Route path="/app" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
