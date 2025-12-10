import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import HomePage from './pages/HomePage'
import DevicesPage from './pages/DevicesPage'
import DeviceDetailPage from './pages/DeviceDetailPage'

const router = createBrowserRouter(
  [
    { path: '/', element: <HomePage /> },
    { path: '/devices', element: <DevicesPage /> },
    { path: '/devices/:id', element: <DeviceDetailPage /> },
  ],
  {
    basename: '/energycalc-frontend',
  },
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)
