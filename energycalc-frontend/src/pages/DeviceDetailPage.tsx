import type { FC } from 'react'
import type { Device } from '../types'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Spinner, Alert } from 'react-bootstrap'
import Header from '../components/Header'
import Breadcrumbs from '../components/Breadcrumbs'
import { apiClient } from '../api/client'
import styles from '../styles/DeviceDetail.module.css'
import { getProxyImageUrl } from '../utils/imageUrl'

const DeviceDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const [device, setDevice] = useState<Device | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDevice = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        const deviceData = await apiClient.getDeviceById(parseInt(id))
        setDevice(deviceData)
      } catch (err) {
        setError('Ошибка при загрузке устройства')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDevice()
  }, [id])

  if (loading) {
    return (
      <>
        <Header />
        <Container className="text-center">
          <Spinner animation="border" />
        </Container>
      </>
    )
  }

  if (error || !device) {
    return (
      <>
        <Header />
        <Container>
          <Alert variant="danger">
            {error || 'Устройство не найдено'}
          </Alert>
        </Container>
      </>
    )
  }

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs 
          crumbs={[
            { label: 'Устройства', path: '/devices' },
            { label: device.name }
          ]} 
        />

        <div className={styles.deviceDetailContainer}>
          <div className={styles.deviceContent}>
            <div className={styles.deviceImageSection}>
              <img 
                src={getProxyImageUrl(device.image_url)} 
                alt={device.name}
                className={styles.deviceImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-device.jpg'
                }}
              />
            </div>
            
            <div className={styles.deviceInfoSection}>
              <div className={styles.deviceCategory}>
                <div className={styles.categoryText}>{device.category}</div>
              </div>
              
              <div className={styles.deviceTitleSection}>
                <div className={styles.deviceTitle}>{device.name}</div>
              </div>
              
              <div className={styles.deviceSpecs}>
                <div className={styles.specItem}>
                  <div className={styles.specLabel}>Номинальная мощность:</div>
                  <div className={styles.specValue}>
                    <span className={styles.valueContent}>
                      <span className={styles.valueNumber}>{device.power}</span>
                      <span className={styles.valueUnit}>Вт</span>
                    </span>
                  </div>
                </div>
                
                {device.peak_power && (
                  <div className={styles.specItem}>
                    <div className={styles.specLabel}>Пиковая мощность:</div>
                    <div className={styles.specValue}>
                      <span className={styles.valueContent}>
                        <span className={styles.valueNumber}>{device.peak_power}</span>
                        <span className={styles.valueUnit}>Вт</span>
                      </span>
                    </div>
                  </div>
                )}
                
                {device.voltage && (
                  <div className={styles.specItem}>
                    <div className={styles.specLabel}>Напряжение питания:</div>
                    <div className={styles.specValue}>
                      <span className={styles.valueContent}>
                        <span className={styles.valueNumber}>{device.voltage}</span>
                        <span className={styles.valueUnit}>В</span>
                      </span>
                    </div>
                  </div>
                )}
                
                {device.energy_class && (
                  <div className={styles.specItem}>
                    <div className={styles.specLabel}>Класс энергоэффективности:</div>
                    <div className={`${styles.specValue} ${styles.energyClass}`}>
                      {device.energy_class}
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.deviceConsumption}>
                <div className={styles.consumptionText}>
                  <span className={styles.consumptionLabel}>Среднее потребление: </span>
                  <span className={styles.consumptionValue}>{device.consumption} кВт/мес</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}

export default DeviceDetailPage