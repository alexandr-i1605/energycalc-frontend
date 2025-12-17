import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store/store'
import { getCartInfoAsync } from '../store/requestSlice'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCartInfoAsync())
    }
  }, [dispatch, isAuthenticated])

  return <>{children}</>
}
