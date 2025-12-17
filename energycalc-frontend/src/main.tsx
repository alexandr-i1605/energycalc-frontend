import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { AuthProvider } from './components/AuthProvider'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import HomePage from './pages/HomePage'
import DevicesPage from './pages/DevicesPage'
import DeviceDetailPage from './pages/DeviceDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RequestsListPage from './pages/RequestsListPage'
import RequestDetailPage from './pages/RequestDetailPage'
import ProfilePage from './pages/ProfilePage'

const router = createBrowserRouter(
  [
    { path: '/', element: <HomePage /> },
    { path: '/devices', element: <DevicesPage /> },
    { path: '/devices/:id', element: <DeviceDetailPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/requests', element: <RequestsListPage /> },
    { path: '/calculation/:id', element: <RequestDetailPage /> },
    { path: '/profile', element: <ProfilePage /> },
  ],
  {
    basename: '/energycalc-frontend/',
  },
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
)
