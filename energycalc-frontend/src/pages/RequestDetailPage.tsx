import React, { useEffect, useState } from 'react'
import { Container, Button, Spinner, Alert, Form, Table, Badge } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../store/store'
import {
  getRequestByIdAsync,
  updateRequestAsync,
  deleteRequestAsync,
  formRequestAsync,
  updateDeviceInRequestAsync,
  deleteDeviceFromRequestAsync,
  clearCurrentRequest,
  setError,
} from '../store/requestSlice'
import Header from '../components/Header'
import Breadcrumbs from '../components/Breadcrumbs'
import { getProxyImageUrl } from '../utils/imageUrl'

const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { currentRequest, devices, loading, error, isDraft } = useSelector(
    (state: RootState) => state.request
  )
  const { isAuthenticated } = useSelector((state: RootState) => state.user)

  const [residents, setResidents] = useState(1)
  const [temperature, setTemperature] = useState(20)
  const [localDevices, setLocalDevices] = useState<typeof devices>([])
  const [savingDeviceId, setSavingDeviceId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (id) {
      dispatch(getRequestByIdAsync(Number(id)))
    }
    return () => {
      dispatch(clearCurrentRequest())
    }
  }, [dispatch, id, isAuthenticated, navigate])

  useEffect(() => {
    if (currentRequest) {
      setResidents(currentRequest.residents)
      setTemperature(currentRequest.temperature)
    }
  }, [currentRequest])

  useEffect(() => {
    // Обновляем локальное состояние при изменении данных с сервера
    setLocalDevices(devices)
  }, [devices])

  const handleSave = async () => {
    if (!id) return
    
    // Сохраняем только параметры заявки (жильцы и температура)
    const requestResult = await dispatch(updateRequestAsync({ requestId: Number(id), data: { residents, temperature } }))
    if (!updateRequestAsync.fulfilled.match(requestResult)) {
      return
    }
    
    // Обновляем данные заявки
    dispatch(getRequestByIdAsync(Number(id)))
  }

  const handleSaveDevice = async (deviceId: number) => {
    if (!id) return
    
    const localDevice = localDevices.find((d) => d.device.id === deviceId)
    if (!localDevice) return

    const originalDevice = devices.find((d) => d.device.id === deviceId)
    if (!originalDevice || originalDevice.quantity === localDevice.quantity) {
      return // Нет изменений
    }

    setSavingDeviceId(deviceId)
    try {
      const result = await dispatch(
        updateDeviceInRequestAsync({
          requestId: Number(id),
          deviceId,
          data: { quantity: localDevice.quantity },
        })
      )
      if (updateDeviceInRequestAsync.fulfilled.match(result)) {
        // Обновляем данные заявки
        dispatch(getRequestByIdAsync(Number(id)))
      }
    } finally {
      setSavingDeviceId(null)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      const result = await dispatch(deleteRequestAsync(Number(id)))
      if (deleteRequestAsync.fulfilled.match(result)) {
        navigate('/requests')
      }
    }
  }

  const handleForm = async () => {
    if (!id) return
    if (window.confirm('Подтвердить формирование заявки?')) {
      const result = await dispatch(formRequestAsync(Number(id)))
      if (formRequestAsync.fulfilled.match(result)) {
        dispatch(getRequestByIdAsync(Number(id)))
      }
    }
  }

  const handleQuantityChange = (deviceId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    // Обновляем только локальное состояние, запрос на сервер будет при сохранении
    setLocalDevices((prev) =>
      prev.map((device) =>
        device.device.id === deviceId ? { ...device, quantity: newQuantity } : device
      )
    )
  }

  const handleDeleteDevice = async (deviceId: number) => {
    if (!id) return
    const result = await dispatch(deleteDeviceFromRequestAsync({ requestId: Number(id), deviceId }))
    if (deleteDeviceFromRequestAsync.fulfilled.match(result)) {
      // Обновляем локальное состояние после удаления
      setLocalDevices((prev) => prev.filter((device) => device.device.id !== deviceId))
      dispatch(getRequestByIdAsync(Number(id)))
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      DRAFT: 'secondary',
      FORMED: 'primary',
      COMPLETED: 'success',
      REJECTED: 'danger',
      DELETED: 'dark',
    }
    const labels: Record<string, string> = {
      DRAFT: 'Черновик',
      FORMED: 'Сформирована',
      COMPLETED: 'Завершена',
      REJECTED: 'Отклонена',
      DELETED: 'Удалена',
    }
    return <Badge bg={variants[status]}>{labels[status]}</Badge>
  }

  if (loading && !currentRequest) {
    return (
      <>
        <Header />
        <Container>
          <div className="text-center" style={{ marginTop: '100px' }}>
            <Spinner animation="border" />
          </div>
        </Container>
      </>
    )
  }

  if (!currentRequest) {
    return (
      <>
        <Header />
        <Container>
          <Alert variant="warning">Заявка не найдена</Alert>
        </Container>
      </>
    )
  }

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs crumbs={[{ label: 'Заявки', path: '/requests' }, { label: `Заявка #${id}` }]} />
        <h1 style={{ marginBottom: '30px' }}>
          Заявка #{currentRequest.id} {getStatusBadge(currentRequest.status)}
        </h1>

        {error && (
          <Alert variant="danger" onClose={() => dispatch(setError(null))} dismissible>
            {error}
          </Alert>
        )}

        <div style={{ marginBottom: '30px' }}>
          {isDraft ? (
            <div>
              <Form.Group className="mb-3">
                <Form.Label>Количество жильцов</Form.Label>
                <Form.Control
                  type="number"
                  value={residents}
                  onChange={(e) => setResidents(Number(e.target.value))}
                  min="1"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Температура (°C)</Form.Label>
                <Form.Control
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  min="-50"
                  max="50"
                />
              </Form.Group>
              <Button variant="primary" onClick={handleSave} className="me-2">
                Сохранить
              </Button>
              <Button variant="success" onClick={handleForm} className="me-2">
                Подтвердить
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Удалить
              </Button>
            </div>
          ) : (
            <div>
              <p>
                <strong>Количество жильцов:</strong> {currentRequest.residents}
              </p>
              <p>
                <strong>Температура:</strong> {currentRequest.temperature}°C
              </p>
              {currentRequest.status === 'COMPLETED' && currentRequest.result > 0 && (
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: '#d4edda',
                    border: '2px solid #28a745',
                    borderRadius: '8px',
                    marginTop: '15px',
                    marginBottom: '15px',
                  }}
                >
                  <h4 style={{ color: '#155724', marginBottom: '10px' }}>
                    Результат расчета энергопотребления
                  </h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724', margin: 0 }}>
                    {currentRequest.result} кВт/мес
                  </p>
                </div>
              )}
              {currentRequest.status !== 'COMPLETED' && currentRequest.result > 0 && (
                <p>
                  <strong>Результат:</strong> {currentRequest.result} кВт/мес
                </p>
              )}
              {currentRequest.status === 'COMPLETED' && currentRequest.result === 0 && (
                <p>
                  <strong>Результат:</strong> Рассчитывается...
                </p>
              )}
              <p>
                <strong>Дата создания:</strong>{' '}
                {new Date(currentRequest.creation_datetime).toLocaleString('ru-RU')}
              </p>
              {currentRequest.formation_datetime && (
                <p>
                  <strong>Дата формирования:</strong>{' '}
                  {new Date(currentRequest.formation_datetime).toLocaleString('ru-RU')}
                </p>
              )}
              {currentRequest.completion_datetime && (
                <p>
                  <strong>Дата завершения:</strong>{' '}
                  {new Date(currentRequest.completion_datetime).toLocaleString('ru-RU')}
                </p>
              )}
            </div>
          )}
        </div>

        <h2 style={{ marginBottom: '20px' }}>Устройства в заявке</h2>

        {localDevices.length === 0 ? (
          <Alert variant="info">В заявке нет устройств</Alert>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Изображение</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Мощность (Вт)</th>
                <th>Потребление (кВт/мес)</th>
                <th>Количество</th>
                {isDraft && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {localDevices.map((deviceInRequest) => (
                <tr key={deviceInRequest.device.id}>
                  <td>
                    <img
                      src={getProxyImageUrl(deviceInRequest.device.image_url)}
                      alt={deviceInRequest.device.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7QpNGD0L3QutC4INCy0LXRgtC+0L3QsDwvdGV4dD48L3N2Zz4='
                      }}
                    />
                  </td>
                  <td>{deviceInRequest.device.name}</td>
                  <td>{deviceInRequest.device.category}</td>
                  <td>{deviceInRequest.device.power}</td>
                  <td>{deviceInRequest.device.consumption}</td>
                  <td>
                    {isDraft ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Form.Control
                          type="number"
                          value={deviceInRequest.quantity}
                          onChange={(e) =>
                            handleQuantityChange(deviceInRequest.device.id, Number(e.target.value))
                          }
                          min="1"
                          style={{ width: '80px' }}
                        />
                        {(() => {
                          const originalDevice = devices.find((d) => d.device.id === deviceInRequest.device.id)
                          const hasChanges = originalDevice && originalDevice.quantity !== deviceInRequest.quantity
                          return (
                            hasChanges && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSaveDevice(deviceInRequest.device.id)}
                                disabled={savingDeviceId === deviceInRequest.device.id}
                              >
                                {savingDeviceId === deviceInRequest.device.id ? (
                                  <>
                                    <Spinner animation="border" size="sm" style={{ marginRight: '5px' }} />
                                    Сохранение...
                                  </>
                                ) : (
                                  'Сохранить'
                                )}
                              </Button>
                            )
                          )
                        })()}
                      </div>
                    ) : (
                      deviceInRequest.quantity
                    )}
                  </td>
                  {isDraft && (
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteDevice(deviceInRequest.device.id)}
                      >
                        Удалить
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  )
}

export default RequestDetailPage

