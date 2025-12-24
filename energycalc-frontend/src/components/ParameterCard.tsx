import React from 'react'
import styles from '../styles/ParameterCard.module.css'

interface ParameterCardProps {
  temperature: number
  residents: number
  isDraft: boolean
  onTemperatureChange?: (value: number) => void
  onResidentsChange?: (value: number) => void
}

const ParameterCard: React.FC<ParameterCardProps> = ({
  temperature,
  residents,
  isDraft,
  onTemperatureChange,
  onResidentsChange,
}) => {
  return (
    <div className={styles.parametersCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerTitle}>Параметры расчета</div>
      </div>
      
      <div className={styles.parameterGroup}>
        <div className={styles.parameterLabel}>Средняя температура в месяце (°C)</div>
        <div className={styles.parameterInput}>
          {isDraft && onTemperatureChange ? (
            <input
              type="number"
              value={temperature}
              onChange={(e) => onTemperatureChange(Number(e.target.value))}
              className={styles.inputFieldEditable}
              min="-50"
              max="50"
            />
          ) : (
            <input
              type="text"
              value={temperature}
              className={styles.inputField}
              readOnly
            />
          )}
        </div>
        <div className={styles.parameterHint}>
          Влияет на потребление отопительных и охлаждающих устройств
        </div>
      </div>
      
      <div className={styles.parameterGroup}>
        <div className={styles.parameterLabel}>Количество жителей</div>
        <div className={styles.parameterInput}>
          {isDraft && onResidentsChange ? (
            <input
              type="number"
              value={residents}
              onChange={(e) => onResidentsChange(Number(e.target.value))}
              className={styles.inputFieldEditable}
              min="1"
            />
          ) : (
            <input
              type="text"
              value={residents}
              className={styles.inputField}
              readOnly
            />
          )}
        </div>
        <div className={styles.parameterHint}>
          Влияет на интенсивность использования устройств
        </div>
      </div>
    </div>
  )
}

export default ParameterCard

