import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import { Form, Button, Alert, Container } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { AppDispatch, RootState } from '../store/store'
import { loginUserAsync, clearError } from '../store/userSlice'
import Header from '../components/Header'

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ username: '', password: '' })
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/devices')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (formData.username && formData.password) {
      const result = await dispatch(loginUserAsync(formData))
      if (loginUserAsync.fulfilled.match(result)) {
        navigate('/devices')
      }
    }
  }

  return (
    <>
      <Header />
      <Container style={{ maxWidth: '100%', marginTop: '0' }}>
        <Container style={{ maxWidth: '400px', marginTop: '150px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Рады снова Вас видеть!</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="username" style={{ marginBottom: '15px' }}>
              <Form.Label>Имя пользователя</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Введите имя пользователя"
                required
              />
            </Form.Group>
            <Form.Group controlId="password" style={{ marginBottom: '20px' }}>
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <Link to="/register">Нет аккаунта? Зарегистрироваться</Link>
            </div>
          </Form>
        </Container>
      </Container>
    </>
  )
}

export default LoginPage

