import React, { useEffect, useState } from 'react'
import { Container, Spinner, Alert, Form, Row, Col, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../store/store'
import { getRequestsAsync } from '../store/requestSlice'
import Header from '../components/Header'
import Breadcrumbs from '../components/Breadcrumbs'
import RequestCard from '../components/RequestCard'
import styles from '../styles/RequestCard.module.css'

const RequestsListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { requests, loading, error } = useSelector((state: RootState) => state.request)
  const { isAuthenticated } = useSelector((state: RootState) => state.user)

  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateStart, setDateStart] = useState<string>('')
  const [dateEnd, setDateEnd] = useState<string>('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    // Загружаем заявки с фильтрами
    const filters: { status?: string; date_start?: string; date_end?: string } = {}
    if (statusFilter) filters.status = statusFilter
    // Преобразуем даты из формата YYYY-MM-DD в ISO datetime формат для бэкенда
    if (dateStart) {
      // Добавляем время начала дня (00:00:00)
      filters.date_start = `${dateStart}T00:00:00`
    }
    if (dateEnd) {
      // Добавляем время конца дня (23:59:59)
      filters.date_end = `${dateEnd}T23:59:59`
    }
    dispatch(getRequestsAsync(Object.keys(filters).length > 0 ? filters : undefined))
  }, [dispatch, isAuthenticated, navigate, statusFilter, dateStart, dateEnd])

  const handleCardClick = (requestId: number) => {
    navigate(`/calculation/${requestId}`)
  }

  const handleClearFilters = () => {
    setStatusFilter('')
    setDateStart('')
    setDateEnd('')
  }

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs crumbs={[{ label: 'Заявки' }]} />
        <h1 style={{ marginBottom: '30px' }}>Мои заявки</h1>

        {/* Форма фильтрации */}
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h5 style={{ marginBottom: '20px' }}>Фильтры</h5>
          <Form>
            <Row className="mb-3">
              <Col md={3}>
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
                    <option value="DELETED">Удалена</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Дата начала</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
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
              <Col md={3} className="d-flex align-items-end">
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
              {requests.length === 0 ? (
                <Alert variant="info" style={{ width: '100%', marginTop: '20px' }}>
                  Заявки не найдены
                </Alert>
              ) : (
                requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onClick={() => handleCardClick(request.id)}
                  />
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

