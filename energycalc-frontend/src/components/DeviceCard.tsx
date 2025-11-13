import type { FC } from 'react'
import type { Device } from '../types'
import { Link } from 'react-router-dom'
import styles from '../styles/DeviceCard.module.css'

interface DeviceCardProps {
  device: Device
  onAddToCalculation: (deviceId: number) => void
}

const DeviceCard: FC<DeviceCardProps> = ({ device, onAddToCalculation }) => {
  return (
    <div className={styles.Card}>
      <div className={styles.CardImage}>
        <img 
          src={device.image_url || '/default-device.jpg'} 
          alt={device.name}
          className={styles.CardImg}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-device.jpg'
          }}
        />
      </div>
      
      <div className={styles.CardTitle}>
        <div className={styles.TitleText}>{device.name}</div>
      </div>
      
      <div className={styles.CardCategory}>
        <div className={styles.CategoryText}>{device.category}</div>
      </div>
      
      <div className={styles.CardSpecs}>
        <div className={styles.SpecItem}>
          <span className={styles.SpecLabel}>Мощность:<br/></span>
          <span className={styles.SpecValue}>{device.power} Вт</span>
        </div>
        <div className={styles.SpecItem}>
          <span className={styles.SpecLabel}>Потребление:<br/></span>
          <span className={styles.SpecValue}>{device.consumption} кВт/мес</span>
        </div>
      </div>
      
      <div className={styles.CardButtons}>
        <Link 
          to={`/devices/${device.id}`} 
          className={`${styles.CardButton} ${styles.DetailButton}`}
        >
          <div className={styles.ButtonText}>Подробнее</div>
        </Link>
        
        <button 
          className={styles.CardButton}
          onClick={() => onAddToCalculation(device.id)}
        >
          <div className={styles.ButtonText}>Добавить</div>
        </button>
      </div>
    </div>
  )
}

export default DeviceCard