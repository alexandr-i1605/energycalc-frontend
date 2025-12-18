import React, { useEffect, useState, useRef } from 'react'
import { Container, Spinner, Alert, Form, Row, Col, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../store/store'
import { getRequestsAsync, updateRequestStatusAsync } from '../store/requestSlice'
import Header from '../components/Header'
import Breadcrumbs from '../components/Breadcrumbs'
import RequestCard from '../components/RequestCard'
import styles from '../styles/RequestCard.module.css'

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
      console.error('Error updating request status:', error)
    }
  }

  const filteredRequests = React.useMemo(() => {
    if (!isModerator || !clientFilter) return requests
    return requests.filter(r => r.client_username === clientFilter)
  }, [requests, clientFilter, isModerator])

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs crumbs={[{ label: 'Заявки' }]} />
        <h1 style={{ marginBottom: '30px' }}>{isModerator ? 'Все заявки' : 'Мои заявки'}</h1>

        {/* Форма фильтрации */}
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h5 style={{ marginBottom: '20px' }}>Фильтры</h5>
          <Form>
            <Row className="mb-3">
              <Col md={isModerator ? 2 : 3}>
                <Form.Group>
                  <Form.Label>Статус</Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Все статусы</option>
                    <option value="DRAFT">Черновик</option>
                    <option value="FORMED">Сформирована</option>
                    <option value="COMPLETED">Завершена</option>
                    <option value="REJECTED">Отклонена</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {isModerator && (
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Создатель</Form.Label>
                    <Form.Select
                      value={clientFilter}
                      onChange={(e) => setClientFilter(e.target.value)}
                    >
                      <option value="">Все создатели</option>
                      {uniqueClients.map((client) => (
                        <option key={client} value={client}>
                          {client}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
              <Col md={isModerator ? 2 : 3}>
                <Form.Group>
                  <Form.Label>Дата начала</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={isModerator ? 2 : 3}>
                <Form.Group>
                  <Form.Label>Дата окончания</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                    min={dateStart}
                  />
                </Form.Group>
              </Col>
              <Col md={isModerator ? 4 : 3} className="d-flex align-items-end">
                <Button
                  variant="outline-secondary"
                  onClick={handleClearFilters}
                  style={{ width: '100%' }}
                >
                  Сбросить фильтры
                </Button>
              </Col>
            </Row>
          </Form>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <div className={styles.Cards}>
            <div className={styles.CardStroke}>
              {filteredRequests.length === 0 ? (
                <Alert variant="info" style={{ width: '100%', marginTop: '20px' }}>
                  Заявки не найдены
                </Alert>
              ) : (
                filteredRequests.map((request) => (
                  <div key={request.id} style={{ marginBottom: '20px' }}>
                    <RequestCard
                      request={request}
                      onClick={() => handleCardClick(request.id)}
                    />
                    {isModerator && request.status === 'FORMED' && (
                      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(request.id, 'COMPLETED')
                          }}
                        >
                          Одобрить
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(request.id, 'REJECTED')
                          }}
                        >
                          Отклонить
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Container>
    </>
  )
}

export default RequestsListPage

