import React, { useEffect, useState } from 'react'
import { Spinner, Alert } from 'react-bootstrap'
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
import ParameterCard from '../components/ParameterCard'
import AddedDeviceCard from '../components/AddedDeviceCard'
import ResultCard from '../components/ResultCard'
import styles from '../styles/RequestDetailPage.module.css'

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
    const result = await dispatch(deleteRequestAsync(Number(id)))
    if (deleteRequestAsync.fulfilled.match(result)) {
      navigate('/requests')
    }
  }

  const handleForm = async () => {
    if (!id) return
    const result = await dispatch(formRequestAsync(Number(id)))
    if (formRequestAsync.fulfilled.match(result)) {
      dispatch(getRequestByIdAsync(Number(id)))
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

  if (loading && !currentRequest) {
    return (
      <>
        <Header />
        <div className={styles.calculationContainer}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Spinner animation="border" />
          </div>
        </div>
      </>
    )
  }

  if (!currentRequest) {
    return (
      <>
        <Header />
        <div className={styles.calculationContainer}>
          <div className={styles.calculationContent}>
            <Alert variant="warning">Заявка не найдена</Alert>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className={styles.calculationContainer}>
        {error && (
          <Alert variant="danger" onClose={() => dispatch(setError(null))} dismissible style={{ margin: '10px' }}>
            {error}
          </Alert>
        )}

        <div className={styles.calculationContent}>
          <div className={styles.mainSection}>
            <div className={styles.sectionTitle}>
              <div className={styles.titleContent}>
                Моя заявка на расчет #{currentRequest.id}
              </div>
            </div>
            
            <ParameterCard
              temperature={temperature}
              residents={residents}
              isDraft={isDraft}
              onTemperatureChange={isDraft ? setTemperature : undefined}
              onResidentsChange={isDraft ? setResidents : undefined}
            />
            
            {isDraft && currentRequest && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {(() => {
                  const hasChanges = 
                    currentRequest.temperature !== temperature ||
                    currentRequest.residents !== residents
                  
                  return (
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges}
                      style={{
                        padding: '10px 20px',
                        background: hasChanges ? '#0058A3' : '#B8B8B8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: hasChanges ? 'pointer' : 'not-allowed',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 500,
                      }}
                    >
                      Сохранить параметры
                    </button>
                  )
                })()}
              </div>
            )}
            
            <div className={styles.devicesSection}>
              <div className={styles.sectionTitle}>
                Добавленные устройства ({localDevices.length})
              </div>
              
              {localDevices.length === 0 ? (
                <Alert variant="info">В заявке нет устройств</Alert>
              ) : (
                <div className={styles.devicesList}>
                  {localDevices.map((deviceInRequest) => {
                    const originalDevice = devices.find((d) => d.device.id === deviceInRequest.device.id)
                    const hasChanges = originalDevice && originalDevice.quantity !== deviceInRequest.quantity
                    
                    return (
                      <AddedDeviceCard
                        key={deviceInRequest.device.id}
                        deviceInRequest={deviceInRequest}
                        isDraft={isDraft}
                        hasChanges={hasChanges || false}
                        isSaving={savingDeviceId === deviceInRequest.device.id}
                        onQuantityChange={isDraft ? handleQuantityChange : undefined}
                        onSave={isDraft ? handleSaveDevice : undefined}
                        onDelete={isDraft ? handleDeleteDevice : undefined}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.resultsSection}>
            <div className={styles.sectionTitle}>
              <div className={styles.titleContent}>Результаты расчета</div>
            </div>
            
            <ResultCard
              result={currentRequest.result}
              status={currentRequest.status}
              isDraft={isDraft}
              onForm={isDraft ? handleForm : undefined}
              onDelete={isDraft ? handleDelete : undefined}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default RequestDetailPage
