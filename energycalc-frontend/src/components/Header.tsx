import { FC, useEffect, useState } from 'react'
import { Navbar, Nav, Container, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { apiClient } from '../api/client'
import { CartInfo } from '../types'
import styles from '../styles/Header.module.css'

const Header: FC = () => {
  const [cartInfo, setCartInfo] = useState<CartInfo>({ draft_request_id: null, devices_count: 0 })

  useEffect(() => {
    const fetchCartInfo = async () => {
      const info = await apiClient.getCartInfo()
      setCartInfo(info)
    }
    fetchCartInfo()
  }, [])

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
            {cartInfo.draft_request_id && (
              <Nav.Link as={Link} to={`/calculation/${cartInfo.draft_request_id}`} className={styles.navLink}>
                Расчет {cartInfo.devices_count > 0 && (
                  <Badge bg="primary" className="ms-1">{cartInfo.devices_count}</Badge>
                )}
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header