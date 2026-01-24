import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function PaymentCancelPage() {
  const navigate = useNavigate()

  useEffect(() => {
    sessionStorage.removeItem('axiscloud_pending_upgrade_plan')
    navigate('/dashboard', { replace: true })
  }, [])

  return null
}
