import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Plus, Trash2, Edit2, Home as HomeIcon } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Loading from '../components/Loading'

const PropertyManagement = () => {
  const { user } = useAuthContext()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [formData, setFormData] = useState({
    address: '',
    area: '',
    purchase_price: '',
    purchase_date: '',
    property_type: 'apartment'
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchProperties()
    }
  }, [user])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProperties(data || [])
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError('부동산 목록을 불러오는데 실패했습니다.')
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
      const propertyData = {
        ...formData,
        area: parseFloat(formData.area),
        purchase_price: parseFloat(formData.purchase_price),
        user_id: user.id
      }

      if (editingProperty) {
        const { error } = await supabase
          .from('user_properties')
          .update(propertyData)
          .eq('id', editingProperty.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_properties')
          .insert([propertyData])

        if (error) throw error
      }

      setIsModalOpen(false)
      setEditingProperty(null)
      setFormData({
        address: '',
        area: '',
        purchase_price: '',
        purchase_date: '',
        property_type: 'apartment'
      })
      fetchProperties()
    } catch (err) {
      console.error('Error saving property:', err)
      setError('부동산 저장에 실패했습니다.')
    }
  }

  const handleEdit = (property) => {
    setEditingProperty(property)
    setFormData({
      address: property.address,
      area: property.area.toString(),
      purchase_price: property.purchase_price.toString(),
      purchase_date: property.purchase_date,
      property_type: property.property_type
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('user_properties')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchProperties()
    } catch (err) {
      console.error('Error deleting property:', err)
      alert('부동산 삭제에 실패했습니다.')
    }
  }

  const openAddModal = () => {
    setEditingProperty(null)
    setFormData({
      address: '',
      area: '',
      purchase_price: '',
      purchase_date: '',
      property_type: 'apartment'
    })
    setIsModalOpen(true)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '만원'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR')
  }

  if (loading) {
    return <Loading message="부동산 목록을 불러오는 중..." />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            내 부동산 관리
          </h2>
          <p className="text-lg text-text-secondary">
            보유한 부동산을 등록하고 관리하세요
          </p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">부동산 등록</span>
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <HomeIcon size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              등록된 부동산이 없습니다
            </h3>
            <p className="text-base text-text-secondary mb-6">
              첫 번째 부동산을 등록해보세요
            </p>
            <Button onClick={openAddModal}>부동산 등록하기</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {property.address}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {property.property_type === 'apartment' ? '아파트' : '기타'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(property)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-base">
                <div className="flex justify-between">
                  <span className="text-text-secondary">면적:</span>
                  <span className="font-medium text-text-primary">
                    {property.area}㎡
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">구매가:</span>
                  <span className="font-medium text-text-primary">
                    {formatPrice(property.purchase_price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">구매일:</span>
                  <span className="font-medium text-text-primary">
                    {formatDate(property.purchase_date)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProperty ? '부동산 수정' : '부동산 등록'}
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
            label="면적 (㎡)"
            name="area"
            type="number"
            value={formData.area}
            onChange={handleChange}
            placeholder="85"
            required
          />

          <Input
            label="구매가격 (만원)"
            name="purchase_price"
            type="number"
            value={formData.purchase_price}
            onChange={handleChange}
            placeholder="50000"
            required
          />

          <Input
            label="구매일자"
            name="purchase_date"
            type="date"
            value={formData.purchase_date}
            onChange={handleChange}
            required
          />

          <div className="mb-4">
            <label className="block text-lg font-medium text-text-primary mb-2">
              부동산 유형
            </label>
            <select
              name="property_type"
              value={formData.property_type}
              onChange={handleChange}
              className="input-large w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="apartment">아파트</option>
              <option value="house">주택</option>
              <option value="land">토지</option>
              <option value="commercial">상가</option>
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="submit" variant="primary" className="flex-1">
              {editingProperty ? '수정' : '등록'}
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

export default PropertyManagement
