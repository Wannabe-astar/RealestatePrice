import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Bell, BellOff, Trash2, Plus } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Loading from '../components/Loading'

const AlertSettings = () => {
  const { user } = useAuthContext()
  const [alerts, setAlerts] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    alert_type: 'price_increase',
    threshold: '10'
  })

  useEffect(() => {
    if (user) {
      fetchAlerts()
      fetchNotifications()
    }
  }, [user])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlerts(data || [])
    } catch (err) {
      console.error('Error fetching alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const { error } = await supabase
        .from('user_alerts')
        .insert([{
          user_id: user.id,
          alert_type: formData.alert_type,
          threshold: parseFloat(formData.threshold),
          is_active: true
        }])

      if (error) throw error

      setIsModalOpen(false)
      setFormData({
        alert_type: 'price_increase',
        threshold: '10'
      })
      fetchAlerts()
    } catch (err) {
      console.error('Error creating alert:', err)
      alert('알림 설정에 실패했습니다.')
    }
  }

  const toggleAlert = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('user_alerts')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchAlerts()
    } catch (err) {
      console.error('Error toggling alert:', err)
      alert('알림 상태 변경에 실패했습니다.')
    }
  }

  const deleteAlert = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchAlerts()
    } catch (err) {
      console.error('Error deleting alert:', err)
      alert('알림 삭제에 실패했습니다.')
    }
  }

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      fetchNotifications()
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const getAlertTypeLabel = (type) => {
    const labels = {
      'price_increase': '시세 상승',
      'price_decrease': '시세 하락',
      'rapid_change': '급변동'
    }
    return labels[type] || type
  }

  if (loading) {
    return <Loading message="알림 설정을 불러오는 중..." />
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          시세 알림 서비스
        </h2>
        <p className="text-lg text-text-secondary">
          부동산 시세 변동 알림을 설정하세요
        </p>
      </div>

      {/* 알림 설정 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-text-primary">
            알림 설정
          </h3>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={20} />
            <span className="hidden sm:inline">알림 추가</span>
          </Button>
        </div>

        {alerts.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Bell size={48} className="mx-auto text-gray-300 mb-4" />
              <h4 className="text-lg font-semibold text-text-primary mb-2">
                설정된 알림이 없습니다
              </h4>
              <p className="text-base text-text-secondary mb-4">
                시세 변동 알림을 추가해보세요
              </p>
              <Button onClick={() => setIsModalOpen(true)}>알림 추가하기</Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {alert.is_active ? (
                      <Bell size={20} className="text-primary" />
                    ) : (
                      <BellOff size={20} className="text-gray-400" />
                    )}
                    <h4 className="text-lg font-semibold text-text-primary">
                      {getAlertTypeLabel(alert.alert_type)}
                    </h4>
                  </div>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-base text-text-secondary">
                    임계값: <span className="font-medium text-text-primary">
                      {alert.threshold}%
                    </span>
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {alert.is_active ? '활성화됨' : '비활성화됨'}
                  </p>
                </div>

                <Button
                  variant={alert.is_active ? 'secondary' : 'primary'}
                  onClick={() => toggleAlert(alert.id, alert.is_active)}
                  className="w-full"
                >
                  {alert.is_active ? '비활성화' : '활성화'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 알림 내역 */}
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          최근 알림 내역
        </h3>

        {notifications.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-base text-text-secondary">
                아직 받은 알림이 없습니다
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors ${
                  !notification.read_at ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => !notification.read_at && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <Bell size={20} className={!notification.read_at ? 'text-primary' : 'text-gray-400'} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-base font-semibold text-text-primary">
                        {notification.title}
                      </h4>
                      <span className="text-sm text-text-secondary whitespace-nowrap ml-2">
                        {new Date(notification.sent_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-base text-text-secondary">
                      {notification.message}
                    </p>
                    {!notification.read_at && (
                      <span className="inline-block mt-2 px-2 py-1 bg-primary text-white text-xs rounded">
                        새 알림
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 알림 추가 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="알림 추가"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-lg font-medium text-text-primary mb-2">
              알림 유형
            </label>
            <select
              name="alert_type"
              value={formData.alert_type}
              onChange={handleChange}
              className="input-large w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="price_increase">시세 상승</option>
              <option value="price_decrease">시세 하락</option>
              <option value="rapid_change">급변동</option>
            </select>
          </div>

          <Input
            label="임계값 (%)"
            name="threshold"
            type="number"
            value={formData.threshold}
            onChange={handleChange}
            placeholder="10"
            required
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-text-secondary">
              설정한 임계값 이상으로 시세가 변동하면 알림을 받습니다.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="submit" variant="primary" className="flex-1">
              추가
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AlertSettings
