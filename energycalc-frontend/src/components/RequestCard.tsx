import type { FC } from 'react'
import type { CalculationRequest } from '../types'
import { Badge } from 'react-bootstrap'
import styles from '../styles/RequestCard.module.css'

interface RequestCardProps {
  request: CalculationRequest
  onClick: () => void
}

const RequestCard: FC<RequestCardProps> = ({ request, onClick }) => {
  const getStatusBadge = (status: CalculationRequest['status']) => {
    const variants: Record<CalculationRequest['status'], string> = {
      DRAFT: 'secondary',
      FORMED: 'primary',
      COMPLETED: 'success',
      REJECTED: 'danger',
      DELETED: 'dark',
    }
    const labels: Record<CalculationRequest['status'], string> = {
      DRAFT: 'Черновик',
      FORMED: 'Сформирована',
      COMPLETED: 'Завершена',
      REJECTED: 'Отклонена',
      DELETED: 'Удалена',
    }
    return <Badge bg={variants[status]}>{labels[status]}</Badge>
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
    <div className={styles.Card} onClick={onClick}>
      <div className={styles.CardHeader}>
        <div className={styles.CardTitle}>
          <div className={styles.TitleText}>Заявка #{request.id}</div>
        </div>
        <div className={styles.StatusBadge}>{getStatusBadge(request.status)}</div>
      </div>

      <div className={styles.CardSpecs}>
        <div className={styles.SpecItem}>
          <span className={styles.SpecLabel}>Жильцов:</span>
          <span className={styles.SpecValue}>{request.residents}</span>
        </div>
        <div className={styles.SpecItem}>
          <span className={styles.SpecLabel}>Температура:</span>
          <span className={styles.SpecValue}>{request.temperature}°C</span>
        </div>
        {request.devices_count !== undefined && (
          <div className={styles.SpecItem}>
            <span className={styles.SpecLabel}>Устройств:</span>
            <span className={styles.SpecValue}>{request.devices_count}</span>
          </div>
        )}
      </div>

      {request.status === 'COMPLETED' && request.result > 0 && (
        <div className={styles.ResultBlock}>
          <div className={styles.ResultLabel}>Результат:</div>
          <div className={styles.ResultValue}>{request.result} кВт/мес</div>
        </div>
      )}

      {request.status !== 'COMPLETED' && request.result > 0 && (
        <div className={styles.CardSpecs}>
          <div className={styles.SpecItem}>
            <span className={styles.SpecLabel}>Результат:</span>
            <span className={styles.SpecValue}>{request.result} кВт/мес</span>
          </div>
        </div>
      )}

      <div className={styles.CardFooter}>
        <div className={styles.DateText}>{formatDate(request.creation_datetime)}</div>
      </div>
    </div>
  )
}

export default RequestCard

