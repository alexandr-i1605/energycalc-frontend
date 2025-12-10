import { FC, useState, useEffect, useRef } from 'react'
import { Container, Spinner, Alert } from 'react-bootstrap'
import { useSearchParams, Link } from 'react-router-dom'
import Header from '../components/Header'
import Breadcrumbs from '../components/Breadcrumbs'
import DeviceCard from '../components/DeviceCard'
import { apiClient } from '../api/client'
import { Device, CartInfo } from '../types'
import styles from '../styles/DevicesPage.module.css'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../store/store'
import { setSearch } from '../store/filterSlice'


const DevicesPage: FC = () => {
  const [devices, setDevices] = useState<Device[]>([])
  const [cartInfo, setCartInfo] = useState<CartInfo>({ draft_request_id: null, devices_count: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [searchParams, setSearchParams] = useSearchParams()

  const reduxSearch = useSelector((state: RootState) => state.filters.search)
  const dispatch = useDispatch()
  const searchTerm = searchParams.get('search') ?? reduxSearch

  const searchInputRef = useRef<HTMLInputElement>(null)

  const fetchDevices = async (search: string = '') => {
    setLoading(true)
    setError('')
    try {
      const data = await apiClient.getDevices(search)
      setDevices(data)
    } catch (err) {
      setError('Ошибка при загрузке устройств')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices(searchTerm)
  }, [searchTerm])


  const handleSearchIconClick = () => {
    if (searchInputRef.current) {
      const searchValue = searchInputRef.current.value
      dispatch(setSearch(searchValue))
      setSearchParams(searchValue ? { search: searchValue } : {})
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearchIconClick()
  }


  const handleAddToCalculation = async (deviceId: number) => {
    try {
      await apiClient.addDeviceToRequest(deviceId)
      //alert('Устройство добавлено в расчет')
      // Обновляем информацию о корзине
      const info = await apiClient.getCartInfo()
      setCartInfo(info)
    } catch (err) {
      alert('Ошибка при добавлении устройства')
      console.error(err)
    }
  }

  const isCartActive = cartInfo.draft_request_id !== null

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs crumbs={[{ label: 'Устройства' }]} />
        
        {/* Header с поиском и корзиной */}
        <div className={styles.Header2}>
          <div className={styles.Search}>
            <img 
              src="/energycalc-frontend/icons/search.svg" 
              alt="Поиск" 
              className={styles.SearchIcon}
              onClick={handleSearchIconClick}
            />
            <input 
              ref={searchInputRef}
              type="text"
              defaultValue={searchTerm}
              placeholder="Найти устройство" 
              className={styles.SearchInput}
              onKeyPress={handleKeyPress}
            />
          </div>
          
          {isCartActive && cartInfo.draft_request_id ? (
            <Link 
              to={`/calculation/${cartInfo.draft_request_id}`} 
              className={styles.CalcBtn}
            >
              <img src="/energycalc-frontend/icons/bolt.svg" alt="Энергия" className={styles.EnergyWindow} />
              {cartInfo.devices_count > 0 && (
                <div className={styles.Ellipse1}>
                  <div className={styles.Counter}>{cartInfo.devices_count}</div>
                </div>
              )}
            </Link>
          ) : (
            <div className={`${styles.CalcBtn} ${styles.CalcBtnDisabled}`}>
              <img src="/energycalc-frontend//icons/bolt.svg" alt="Энергия" className={styles.EnergyWindow} />
              {cartInfo.devices_count > 0 && (
                <div className={styles.Ellipse1}>
                  <div className={styles.Counter}>{cartInfo.devices_count}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <div className={styles.Cards}>
            <div className={styles.CardStroke}>
              {devices.map((device) => (
                <DeviceCard 
                  key={device.id}
                  device={device} 
                  onAddToCalculation={handleAddToCalculation}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && devices.length === 0 && (
          <Alert variant="info">
            Устройства не найдены.
          </Alert>
        )}
      </Container>
    </>
  )
}

export default DevicesPage