import { createBrowserRouter } from 'react-router'
import { Toaster } from "react-hot-toast"
import './App.css'
import { lazy } from 'react'
import { RouterProvider } from 'react-router/dom'

const SchedulePage = lazy(() => import('./components/pages/SchedulePage.tsx'))
const PeriodPage = lazy(() => import('./components/pages/PeriodPage.tsx'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <SchedulePage />
  },
  {
    path: '/period',
    element: <PeriodPage />
  }
])

function App() {

  return <>
    <RouterProvider router={router} />
    <Toaster />
  </>
}

export default App
