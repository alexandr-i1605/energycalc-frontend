import type { FC } from 'react'
import type { CalculationRequest } from '../types'
import styles from '../styles/RequestCard.module.css'

interface RequestCardProps {
  request: CalculationRequest
  onClick: () => void
  isModerator?: boolean
  onApprove?: (requestId: number) => void
  onReject?: (requestId: number) => void
}

const RequestCard: FC<RequestCardProps> = ({ 
  request, 
  onClick, 
  isModerator = false,
  onApprove,
  onReject,
}) => {
  const getStatusBadge = (status: CalculationRequest['status']) => {
    const labels: Record<CalculationRequest['status'], string> = {
      DRAFT: 'Черновик',
      FORMED: 'Сформирована',
      COMPLETED: 'Завершена',
      REJECTED: 'Отклонена',
      DELETED: 'Удалена',
    }
    
    const statusClass: Record<CalculationRequest['status'], string> = {
      DRAFT: styles.statusDraft,
      FORMED: styles.statusFormed,
      COMPLETED: styles.statusCompleted,
      REJECTED: styles.statusRejected,
      DELETED: styles.statusDraft,
    }
    
    return (
      <span className={`${styles.statusBadge} ${statusClass[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <div className={styles.titleText}>Заявка #{request.id}</div>
        </div>
        {getStatusBadge(request.status)}
      </div>

      <div className={styles.cardSpecs}>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Жильцов:</span>
          <span className={styles.specValue}>{request.residents}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Температура:</span>
          <span className={styles.specValue}>{request.temperature}°C</span>
        </div>
        {request.devices_count !== undefined && (
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Устройств:</span>
            <span className={styles.specValue}>{request.devices_count}</span>
          </div>
        )}
        {isModerator && request.client_username && (
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Создатель:</span>
            <span className={styles.specValue}>{request.client_username}</span>
          </div>
        )}
      </div>

      {request.status === 'COMPLETED' && request.result > 0 && (
        <div className={styles.resultBlock}>
          <div className={styles.resultLabel}>Результат:</div>
          <div className={styles.resultValue}>{request.result} кВт/мес</div>
        </div>
      )}

      {request.status !== 'COMPLETED' && request.result > 0 && (
        <div className={styles.cardSpecs}>
          <div className={styles.specItem}>
            <span className={styles.specLabel}>Результат:</span>
            <span className={styles.specValue}>{request.result} кВт/мес</span>
          </div>
        </div>
      )}

      <div className={styles.cardFooter}>
        <div className={styles.dateText}>{formatDate(request.creation_datetime)}</div>
      </div>

      {isModerator && request.status === 'FORMED' && (onApprove || onReject) && (
        <div 
          className={styles.moderatorActions}
          onClick={(e) => e.stopPropagation()}
        >
          {onApprove && (
            <button
              className={`${styles.actionButton} ${styles.actionButtonSuccess}`}
              onClick={() => onApprove(request.id)}
            >
              Одобрить
            </button>
          )}
          {onReject && (
            <button
              className={`${styles.actionButton} ${styles.actionButtonDanger}`}
              onClick={() => onReject(request.id)}
            >
              Отклонить
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default RequestCard

