import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiCapturePaypalOrder } from '../lib/api'
import { getAuth, setAuth } from '../lib/auth'

export function PaymentSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { token } = getAuth()

  const orderId = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('token') || params.get('id')
  }, [location.search])

  useEffect(() => {
    if (!token) navigate('/login', { replace: true })
  }, [token, navigate])

  useEffect(() => {
    if (!token) return
    if (!orderId) {
      sessionStorage.removeItem('axiscloud_pending_upgrade_plan')
      navigate('/dashboard', { replace: true })
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        await apiCapturePaypalOrder({ id: orderId })

        const nextPlan = sessionStorage.getItem('axiscloud_pending_upgrade_plan')
        if (nextPlan) {
          setAuth({ token, plan: nextPlan })
        }
        sessionStorage.removeItem('axiscloud_pending_upgrade_plan')
      } catch {
        sessionStorage.removeItem('axiscloud_pending_upgrade_plan')
      } finally {
        if (!cancelled) navigate('/dashboard', { replace: true })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token, orderId, navigate])

  return null
}
