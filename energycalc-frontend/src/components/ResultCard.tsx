import React from 'react'
import styles from '../styles/ResultCard.module.css'

interface ResultCardProps {
  result: number
  status: string
  isDraft: boolean
  onForm?: () => void
  onDelete?: () => void
}

const ResultCard: React.FC<ResultCardProps> = ({
  result,
  status,
  isDraft,
  onForm,
  onDelete,
}) => {
  const isCompleted = status === 'COMPLETED'
  const hasResult = result > 0

  return (
    <div className={styles.resultsCard}>
      <div className={styles.resultsHeader}>
        <div className={styles.resultsTitle}>Энергопотребление за месяц</div>
      </div>
      
      {hasResult ? (
        <>
          <div className={styles.resultsBreakdown}>
            <div className={styles.breakdownItem}>
              <div className={styles.breakdownLabel}>Базовое потребление:</div>
              <div className={styles.breakdownValue}>
                {Math.round(result * 0.7)} кВт/мес
              </div>
            </div>
            <div className={styles.breakdownItem}>
              <div className={styles.breakdownLabel}>Учёт температуры:</div>
              <div className={styles.breakdownValue}>
                +{Math.round(result * 0.15)} кВт/мес
              </div>
            </div>
            <div className={styles.breakdownItem}>
              <div className={styles.breakdownLabel}>Учет жителей:</div>
              <div className={styles.breakdownValue}>
                +{Math.round(result * 0.15)} кВт/мес
              </div>
            </div>
          </div>
          
          <div className={styles.resultsTotal}>
            <div className={styles.totalText}>Итого: {result} кВт/мес</div>
          </div>
        </>
      ) : (
        <div className={styles.resultsTotal}>
          <div className={styles.loadingText}>
            {isCompleted ? 'Рассчитывается...' : 'Нет данных для расчета'}
          </div>
        </div>
      )}

      {isDraft && (onForm || onDelete) && (
        <div className={styles.actionsSection}>
          {onForm && (
            <button
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={onForm}
            >
              Сформировать
            </button>
          )}
          {onDelete && (
            <button
              className={`${styles.actionButton} ${styles.actionButtonDanger}`}
              onClick={onDelete}
            >
              Удалить заявку
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ResultCard

