import React from 'react'
import type { DeviceInRequest } from '../types'
import { getProxyImageUrl, getDefaultImageUrl } from '../utils/imageUrl'
import styles from '../styles/AddedDeviceCard.module.css'

interface AddedDeviceCardProps {
  deviceInRequest: DeviceInRequest
  isDraft: boolean
  hasChanges: boolean
  isSaving: boolean
  onQuantityChange?: (deviceId: number, quantity: number) => void
  onSave?: (deviceId: number) => void
  onDelete?: (deviceId: number) => void
}

const AddedDeviceCard: React.FC<AddedDeviceCardProps> = ({
  deviceInRequest,
  isDraft,
  hasChanges,
  isSaving,
  onQuantityChange,
  onSave,
  onDelete,
}) => {
  const device = deviceInRequest.device

  return (
    <div className={styles.deviceCard}>
      <div className={styles.deviceImage}>
        <img
          src={getProxyImageUrl(device.image_url)}
          alt={device.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = getDefaultImageUrl()
          }}
        />
      </div>
      <div className={styles.deviceInfo}>
        <div className={styles.deviceName}>{device.name}</div>
        <div className={styles.deviceSpecsGrid}>
          <div className={styles.specItem}>
            <div className={styles.specLabel}>Мощность</div>
            <div className={styles.specValue}>{device.power} Вт</div>
          </div>
          <div className={styles.specItem}>
            <div className={styles.specLabel}>Потребление</div>
            <div className={styles.specValue}>{device.consumption} кВт/мес</div>
          </div>
          {device.work_per_day && (
            <div className={styles.specItem}>
              <div className={styles.specLabel}>Работает в день</div>
              <div className={styles.specValue}>~{device.work_per_day}</div>
            </div>
          )}
          {device.energy_class && (
            <div className={styles.specItem}>
              <div className={styles.specLabel}>Класс энергоэффективности</div>
              <div className={styles.specValue}>{device.energy_class}</div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.deviceQuantity}>
        {isDraft ? (
          <>
            <div className={styles.quantityInputWrapper}>
              <input
                type="number"
                value={deviceInRequest.quantity}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (value >= 1 && onQuantityChange) {
                    onQuantityChange(device.id, value)
                  }
                }}
                className={styles.inputField}
                min="1"
              />
            </div>
            <div className={styles.buttonsWrapper}>
              {onSave && (
                <button
                  className={styles.saveButton}
                  onClick={() => onSave(device.id)}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              )}
              {onDelete && (
                <button
                  className={styles.deleteButton}
                  onClick={() => onDelete(device.id)}
                >
                  Удалить
                </button>
              )}
            </div>
          </>
        ) : (
          <div className={styles.quantityDisplay}>
            <input
              type="text"
              value={deviceInRequest.quantity}
              className={styles.inputField}
              readOnly
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default AddedDeviceCard

