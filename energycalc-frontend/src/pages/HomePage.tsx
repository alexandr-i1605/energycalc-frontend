import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import styles from '../styles/HomePage.module.css'

const HomePage: FC = () => {
  const navigate = useNavigate()

  const handleStartCalculation = () => {
    navigate('/devices')
  }

  return (
    <>
      <Header />
      <div className={styles.homePage}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <h1 className={styles.heroTitle}>EnergyCalc</h1>
          <p className={styles.heroSubtitle}>
            Умный калькулятор для расчета энергопотребления ваших устройств
          </p>
          <button 
            className={styles.heroButton}
            onClick={handleStartCalculation}
          >
            Начать расчет
          </button>
        </div>

        {/* Features Section */}
        <div className={styles.featuresSection}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureTitle}>Расчет потребления</h3>
              <p className={styles.featureDescription}>
                Рассчитайте энергопотребление всех ваших устройств с учетом 
                температуры и количества жителей
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔌</div>
              <h3 className={styles.featureTitle}>База устройств</h3>
              <p className={styles.featureDescription}>
                Большая база бытовых устройств с подробными характеристиками 
                и классами энергоэффективности
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💡</div>
              <h3 className={styles.featureTitle}>Экономия энергии</h3>
              <p className={styles.featureDescription}>
                Оптимизируйте использование энергии и сократите расходы 
                на коммунальные услуги
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomePage