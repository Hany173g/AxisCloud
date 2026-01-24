import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { CreateMonitorPage } from './pages/CreateMonitorPage'
import { MonitorsPage } from './pages/MonitorsPage'
import { MonitorDetailsPage } from './pages/MonitorDetailsPage'
import { PaymentUpgradePage } from './pages/PaymentUpgradePage'
import { PaymentSuccessPage } from './pages/PaymentSuccessPage'
import { PaymentCancelPage } from './pages/PaymentCancelPage'
import { getAuth } from './lib/auth'

function App() {
  const { token } = getAuth()

  return (
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
  )
}

export default App
