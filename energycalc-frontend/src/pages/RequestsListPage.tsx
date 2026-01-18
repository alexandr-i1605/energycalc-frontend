import React, { useEffect, useState, useRef } from 'react'
import { Spinner, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../store/store'
import { getRequestsAsync, updateRequestStatusAsync } from '../store/requestSlice'
import Header from '../components/Header'
import RequestCard from '../components/RequestCard'
import styles from '../styles/RequestsListPage.module.css'

// Функция для получения текущей даты в формате YYYY-MM-DD
const getCurrentDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const RequestsListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { requests, loading, error } = useSelector((state: RootState) => state.request)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.user)
  const isModerator = user?.is_moderator || false

  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateStart, setDateStart] = useState<string>(getCurrentDate())
  const [dateEnd, setDateEnd] = useState<string>(getCurrentDate())
  const [clientFilter, setClientFilter] = useState<string>('')
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const uniqueClients = React.useMemo(() => {
    if (!isModerator) return []
    const clients = new Set(requests.map(r => r.client_username).filter(Boolean))
    return Array.from(clients).sort()
  }, [requests, isModerator])

  const loadRequests = React.useCallback(() => {
    const filters: { status?: string; date_start?: string; date_end?: string } = {}
    if (statusFilter) filters.status = statusFilter

    if (dateStart) {
      filters.date_start = `${dateStart}T00:00:00`
    }
    if (dateEnd) {
      filters.date_end = `${dateEnd}T23:59:59`
    }
    dispatch(getRequestsAsync(filters))
  }, [dispatch, statusFilter, dateStart, dateEnd])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadRequests()
  }, [dispatch, isAuthenticated, navigate, loadRequests])

  useEffect(() => {
    if (!isAuthenticated || !isModerator) return

    pollingIntervalRef.current = setInterval(() => {
      loadRequests()
    }, 5000)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [isAuthenticated, isModerator, loadRequests])

  const handleCardClick = (requestId: number) => {
    navigate(`/consumption-calculation/${requestId}`)
  }

  const handleClearFilters = () => {
    setStatusFilter('')
    setDateStart(getCurrentDate())
    setDateEnd(getCurrentDate())
    setClientFilter('')
  }

  const handleStatusChange = async (requestId: number, newStatus: 'COMPLETED' | 'REJECTED') => {
    try {
      await dispatch(updateRequestStatusAsync({ requestId, newStatus })).unwrap()
      loadRequests()
    } catch (error) {
    }
  }

  const filteredRequests = React.useMemo(() => {
    if (!isModerator || !clientFilter) return requests
    return requests.filter(r => r.client_username === clientFilter)
  }, [requests, clientFilter, isModerator])

  return (
    <>
      <Header />
      <div className={styles.requestsContainer}>
        {error && (
          <Alert variant="danger" style={{ margin: '10px' }}>
            {error}
          </Alert>
        )}

        <div className={styles.requestsContent}>
          <div className={styles.sectionTitle}>
            <div className={styles.titleContent}>
              {isModerator ? 'Все заявки' : 'Мои заявки'}
            </div>
          </div>

          {/* Форма фильтрации */}
          <div className={styles.filtersCard}>
            <div className={styles.filtersHeader}>
              <div className={styles.filtersTitle}>Фильтры</div>
            </div>
            
            <div className={styles.filtersRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Статус</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.filterInput}
                >
                  <option value="">Все статусы</option>
                  <option value="DRAFT">Черновик</option>
                  <option value="FORMED">Сформирована</option>
                  <option value="COMPLETED">Завершена</option>
                  <option value="REJECTED">Отклонена</option>
                </select>
              </div>

              {isModerator && (
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Создатель</label>
                  <select
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                    className={styles.filterInput}
                  >
                    <option value="">Все создатели</option>
                    {uniqueClients.map((client) => (
                      <option key={client} value={client}>
                        {client}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Дата начала</label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Дата окончания</label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  min={dateStart}
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <button
                  onClick={handleClearFilters}
                  className={styles.filterButton}
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </div>

          {/* Список заявок */}
          <div className={styles.sectionTitle}>
            <div className={styles.titleContent}>
              Заявки ({filteredRequests.length})
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <Spinner animation="border" />
            </div>
          ) : (
            <div className={styles.requestsList}>
              {filteredRequests.length === 0 ? (
                <div className={styles.emptyState}>
                  Заявки не найдены
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onClick={() => handleCardClick(request.id)}
                    isModerator={isModerator}
                    onApprove={isModerator && request.status === 'FORMED' 
                      ? () => handleStatusChange(request.id, 'COMPLETED')
                      : undefined
                    }
                    onReject={isModerator && request.status === 'FORMED'
                      ? () => handleStatusChange(request.id, 'REJECTED')
                      : undefined
                    }
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default RequestsListPage
