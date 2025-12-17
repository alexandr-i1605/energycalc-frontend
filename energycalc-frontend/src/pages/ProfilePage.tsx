import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../store/store'
import { getUserProfileAsync, updateUserProfileAsync, clearError } from '../store/userSlice'
import Header from '../components/Header'
import Breadcrumbs from '../components/Breadcrumbs'

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { user, loading, error, isAuthenticated } = useSelector((state: RootState) => state.user)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user) {
      dispatch(getUserProfileAsync(user.id))
    }
  }, [dispatch, isAuthenticated, navigate, user?.id])

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        password: '',
        passwordConfirm: '',
      })
    }
  }, [user])

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

    if (formData.password && formData.password !== formData.passwordConfirm) {
      dispatch(clearError())
      return
    }

    if (user) {
      const updateData: {
        first_name?: string
        last_name?: string
        email?: string
        password?: string
      } = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const result = await dispatch(updateUserProfileAsync({ userId: user.id, data: updateData }))
      if (updateUserProfileAsync.fulfilled.match(result)) {
        setFormData({
          ...formData,
          password: '',
          passwordConfirm: '',
        })
      }
    }
  }

  if (loading && !user) {
    return (
      <>
        <Header />
        <Container>
          <div className="text-center" style={{ marginTop: '100px' }}>
            <Spinner animation="border" />
          </div>
        </Container>
      </>
    )
  }

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs crumbs={[{ label: 'Личный кабинет' }]} />
        <h1 style={{ marginBottom: '30px' }}>Личный кабинет</h1>

        {error && <Alert variant="danger">{error}</Alert>}

        {formData.password && formData.password !== formData.passwordConfirm && (
          <Alert variant="warning">Пароли не совпадают</Alert>
        )}

        <Form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
          <Form.Group className="mb-3">
            <Form.Label>Имя пользователя</Form.Label>
            <Form.Control type="text" value={user?.username || ''} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Имя</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Введите имя"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Фамилия</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Введите фамилию"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите email"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Новый пароль (оставьте пустым, если не хотите менять)</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите новый пароль"
            />
          </Form.Group>

          {formData.password && (
            <Form.Group className="mb-3">
              <Form.Label>Подтверждение нового пароля</Form.Label>
              <Form.Control
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="Подтвердите новый пароль"
              />
            </Form.Group>
          )}

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </Form>
      </Container>
    </>
  )
}

export default ProfilePage

