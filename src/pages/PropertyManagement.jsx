import React, { useState, useCallback } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useDataFetch } from '../hooks/useDataFetch'
import { useForm } from '../hooks/useForm'
import { getUserProperties, createEntity, updateEntity, deleteEntity } from '../services/supabaseService'
import { validateRequired, validateAddress, validatePrice, validateRange, validateDate } from '../utils/validation'
import { formatPrice, formatDate, formatArea } from '../utils/formatting'
import { tryCatch } from '../utils/errorHandling'
import { Plus, Trash2, Edit2, Home as HomeIcon } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Loading from '../components/Loading'

const PropertyManagement = () => {
  const { user } = useAuthContext()
  const toast = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)

  // Fetch properties using custom hook
  const {
    data: properties,
    loading,
    error: fetchError,
    refetch
  } = useDataFetch(
    () => getUserProperties(user?.id),
    [user?.id],
    {
      onError: (err) => toast.error('부동산 목록을 불러오는데 실패했습니다.')
    }
  )

  // Form validation schema
  const validationSchema = {
    address: [validateRequired, validateAddress],
    area: [
      validateRequired,
      (value) => validateRange(parseFloat(value), 0.1, 10000, '면적')
    ],
    purchase_price: [
      validateRequired,
      (value) => validatePrice(parseFloat(value), 100)
    ],
    purchase_date: [validateRequired, validateDate],
    property_type: [validateRequired]
  }

  // Form handling with custom hook
  const form = useForm(
    {
      address: '',
      area: '',
      purchase_price: '',
      purchase_date: '',
      property_type: 'apartment'
    },
    validationSchema,
    async (values) => {
      await handleFormSubmit(values)
    }
  )

  const handleFormSubmit = async (values) => {
    const propertyData = {
      address: values.address,
      area: parseFloat(values.area),
      purchase_price: parseFloat(values.purchase_price),
      purchase_date: values.purchase_date,
      property_type: values.property_type,
      user_id: user.id
    }

    const [result, error] = await tryCatch(async () => {
      if (editingProperty) {
        return await updateEntity('user_properties', editingProperty.id, propertyData)
      } else {
        return await createEntity('user_properties', propertyData)
      }
    })

    if (error) {
      toast.error(editingProperty ? '부동산 수정에 실패했습니다.' : '부동산 등록에 실패했습니다.')
      return
    }

    if (result?.error) {
      toast.error(result.error.message || '오류가 발생했습니다.')
      return
    }

    toast.success(editingProperty ? '부동산이 수정되었습니다.' : '부동산이 등록되었습니다.')
    setIsModalOpen(false)
    setEditingProperty(null)
    form.resetForm()
    refetch()
  }

  const handleEdit = useCallback((property) => {
    setEditingProperty(property)
    form.setFieldValue('address', property.address)
    form.setFieldValue('area', property.area.toString())
    form.setFieldValue('purchase_price', property.purchase_price.toString())
    form.setFieldValue('purchase_date', property.purchase_date)
    form.setFieldValue('property_type', property.property_type)
    setIsModalOpen(true)
  }, [form])

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return

    const [result, error] = await tryCatch(() => deleteEntity('user_properties', id))

    if (error || result?.error) {
      toast.error('부동산 삭제에 실패했습니다.')
      return
    }

    toast.success('부동산이 삭제되었습니다.')
    refetch()
  }

  const openAddModal = () => {
    setEditingProperty(null)
    form.resetForm()
    setIsModalOpen(true)
  }

  const getPropertyTypeLabel = (type) => {
    const types = {
      apartment: '아파트',
      house: '주택',
      land: '토지',
      commercial: '상가'
    }
    return types[type] || type
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

      {(!properties || properties.length === 0) ? (
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
                    {getPropertyTypeLabel(property.property_type)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(property)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    aria-label="수정"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    aria-label="삭제"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-base">
                <div className="flex justify-between">
                  <span className="text-text-secondary">면적:</span>
                  <span className="font-medium text-text-primary">
                    {formatArea(property.area)}
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
                    {formatDate(property.purchase_date, 'YYYY.MM.DD')}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          form.resetForm()
        }}
        title={editingProperty ? '부동산 수정' : '부동산 등록'}
      >
        <form onSubmit={form.handleSubmit}>
          <Input
            label="주소"
            {...form.getFieldProps('address')}
            placeholder="서울시 강남구 ..."
            error={form.touched.address && form.errors.address}
            required
          />

          <Input
            label="면적 (㎡)"
            type="number"
            step="0.01"
            {...form.getFieldProps('area')}
            placeholder="85"
            error={form.touched.area && form.errors.area}
            required
          />

          <Input
            label="구매가격 (만원)"
            type="number"
            {...form.getFieldProps('purchase_price')}
            placeholder="50000"
            error={form.touched.purchase_price && form.errors.purchase_price}
            required
          />

          <Input
            label="구매일자"
            type="date"
            {...form.getFieldProps('purchase_date')}
            error={form.touched.purchase_date && form.errors.purchase_date}
            required
          />

          <div className="mb-4">
            <label className="block text-lg font-medium text-text-primary mb-2">
              부동산 유형 <span className="text-error">*</span>
            </label>
            <select
              {...form.getFieldProps('property_type')}
              className="input-large w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-lg"
            >
              <option value="apartment">아파트</option>
              <option value="house">주택</option>
              <option value="land">토지</option>
              <option value="commercial">상가</option>
            </select>
            {form.touched.property_type && form.errors.property_type && (
              <p className="mt-1 text-sm text-error">{form.errors.property_type}</p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={form.isSubmitting}
            >
              {form.isSubmitting ? '처리 중...' : (editingProperty ? '수정' : '등록')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                form.resetForm()
              }}
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
