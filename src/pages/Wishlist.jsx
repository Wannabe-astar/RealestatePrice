import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Heart, Trash2, Plus, DollarSign } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Loading from '../components/Loading'

const Wishlist = () => {
  const { user } = useAuthContext()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    address: '',
    target_price: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchWishlist()
    }
  }, [user])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_wishlist')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWishlist(data || [])
    } catch (err) {
      console.error('Error fetching wishlist:', err)
    } finally {
      setLoading(false)
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
    setError('')

    try {
      const { error } = await supabase
        .from('user_wishlist')
        .insert([{
          user_id: user.id,
          address: formData.address,
          target_price: formData.target_price ? parseFloat(formData.target_price) : null,
          is_active: true
        }])

      if (error) throw error

      setIsModalOpen(false)
      setFormData({
        address: '',
        target_price: ''
      })
      fetchWishlist()
    } catch (err) {
      console.error('Error adding to wishlist:', err)
      setError('찜 추가에 실패했습니다.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('user_wishlist')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      fetchWishlist()
    } catch (err) {
      console.error('Error removing from wishlist:', err)
      alert('찜 삭제에 실패했습니다.')
    }
  }

  const formatPrice = (price) => {
    if (!price) return '-'
    return new Intl.NumberFormat('ko-KR').format(price) + '만원'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR')
  }

  if (loading) {
    return <Loading message="찜 목록을 불러오는 중..." />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            관심 부동산 찜하기
          </h2>
          <p className="text-lg text-text-secondary">
            구매를 희망하는 부동산을 찜하고 추적하세요
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">찜 추가</span>
        </Button>
      </div>

      {wishlist.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              찜한 부동산이 없습니다
            </h3>
            <p className="text-base text-text-secondary mb-6">
              관심있는 부동산을 찜해보세요
            </p>
            <Button onClick={() => setIsModalOpen(true)}>찜 추가하기</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <Card key={item.id}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 flex-1">
                  <Heart size={20} className="text-red-500 fill-red-500" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    찜한 부동산
                  </h3>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-text-secondary mb-1">주소</p>
                <p className="text-base font-medium text-text-primary break-words">
                  {item.address}
                </p>
              </div>

              {item.target_price && (
                <div className="mb-4">
                  <p className="text-sm text-text-secondary mb-1">목표가</p>
                  <div className="flex items-center gap-1">
                    <DollarSign size={16} className="text-success" />
                    <p className="text-base font-medium text-success">
                      {formatPrice(item.target_price)}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-border">
                <p className="text-sm text-text-secondary">
                  추가일: {formatDate(item.created_at)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 안내 카드 */}
      {wishlist.length > 0 && (
        <Card className="mt-6 bg-green-50 border-green-200">
          <div className="flex gap-3">
            <Heart size={24} className="text-success mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-semibold text-success mb-2">
                찜한 부동산 알림
              </h4>
              <p className="text-base text-text-secondary">
                찜한 부동산의 시세가 목표가에 도달하면 알림을 받을 수 있습니다.
                알림 페이지에서 설정해보세요.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 찜 추가 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="찜 추가"
      >
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="주소"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="서울시 강남구 ..."
            required
          />

          <Input
            label="목표가 (만원, 선택사항)"
            name="target_price"
            type="number"
            value={formData.target_price}
            onChange={handleChange}
            placeholder="50000"
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-text-secondary">
              목표가를 설정하면 해당 가격에 도달했을 때 알림을 받을 수 있습니다.
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

export default Wishlist
