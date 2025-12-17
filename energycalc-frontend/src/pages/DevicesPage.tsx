import { FC, useEffect, useRef } from 'react'
import { Container, Spinner, Alert } from 'react-bootstrap'
import { useSearchParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '../store/store'
import { setSearch } from '../store/filterSlice'
import { getDevicesAsync } from '../store/deviceSlice'
import { getCartInfoAsync, addDeviceToRequestAsync } from '../store/requestSlice'
import Header from '../components/Header'
import Breadcrumbs from '../components/Breadcrumbs'
import DeviceCard from '../components/DeviceCard'
import styles from '../styles/DevicesPage.module.css'

const DevicesPage: FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [searchParams, setSearchParams] = useSearchParams()

  const reduxSearch = useSelector((state: RootState) => state.filters.search)
  const { devices, loading, error } = useSelector((state: RootState) => state.device)
  const { cartInfo } = useSelector((state: RootState) => state.request)
  const { isAuthenticated } = useSelector((state: RootState) => state.user)

  const searchTerm = searchParams.get('search') ?? reduxSearch
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    dispatch(getDevicesAsync(searchTerm || undefined))
  }, [dispatch, searchTerm])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCartInfoAsync())
    }
  }, [dispatch, isAuthenticated])

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
    await dispatch(addDeviceToRequestAsync(deviceId))
    if (isAuthenticated) {
      dispatch(getCartInfoAsync())
    }
  }

  const isCartActive = isAuthenticated && cartInfo.draft_request_id !== null

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
            <Link to={`/calculation/${cartInfo.draft_request_id}`} className={styles.CalcBtn}>
              <img
                src="/energycalc-frontend/icons/bolt.svg"
                alt="Энергия"
                className={styles.EnergyWindow}
              />
              {cartInfo.devices_count > 0 && (
                <div className={styles.Ellipse1}>
                  <div className={styles.Counter}>{cartInfo.devices_count}</div>
                </div>
              )}
            </Link>
          ) : (
            <div className={`${styles.CalcBtn} ${styles.CalcBtnDisabled}`}>
              <img
                src="/energycalc-frontend/icons/bolt.svg"
                alt="Энергия"
                className={styles.EnergyWindow}
              />
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
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && devices.length === 0 && (
          <Alert variant="info">Устройства не найдены.</Alert>
        )}
      </Container>
    </>
  )
}

export default DevicesPage
