import { FC, useEffect } from 'react'
import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '../store/store'
import { getCartInfoAsync } from '../store/requestSlice'
import { logoutUserAsync } from '../store/userSlice'
import { clearFilters } from '../store/filterSlice'
import { getDevicesAsync } from '../store/deviceSlice'
import styles from '../styles/Header.module.css'

const Header: FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { cartInfo } = useSelector((state: RootState) => state.request)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCartInfoAsync())
    }
  }, [dispatch, isAuthenticated])

  const handleLogout = async () => {
    await dispatch(logoutUserAsync())
    dispatch(clearFilters())
    dispatch(getDevicesAsync())
    navigate('/devices')
  }

  return (
    <Navbar variant="dark" expand="lg" className={styles.navbarDark}>
      <Container>
        <Navbar.Brand as={Link} to="/" className={styles.navbarBrand}>
          EnergyCalc
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className={styles.navLink}>
              Главная
            </Nav.Link>
            <Nav.Link as={Link} to="/devices" className={styles.navLink}>
              Устройства
            </Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/requests" className={styles.navLink}>
                  Заявки
                </Nav.Link>
                {cartInfo.draft_request_id && (
                  <Nav.Link
                    as={Link}
                    to={`/calculation/${cartInfo.draft_request_id}`}
                    className={styles.navLink}
                  >
                    Расчет{' '}
                    {cartInfo.devices_count > 0 && (
                      <Badge bg="primary" className="ms-1">
                        {cartInfo.devices_count}
                      </Badge>
                    )}
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {!isAuthenticated ? (
              <Link to="/login" className="btn btn-outline-light me-2">
                Войти
              </Link>
            ) : (
              <>
                <Nav.Link as={Link} to="/profile" className={styles.navLink}>
                  {user?.username || 'Профиль'}
                </Nav.Link>
                <Button variant="outline-light" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header
