import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import {Navigate, Route, Routes} from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage  from './pages/DashboardPage.jsx'
import AssetsPage from './pages/AssetsPage.jsx'

function App() {
  return (
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
          <Route
              path="/dashboard"
              element={
                  <ProtectedRoute>
                      <DashboardPage/>
                  </ProtectedRoute>
              }
          />
        <Route
            path="/assets"
            element={
                <ProtectedRoute>
                    <AssetsPage/>
                </ProtectedRoute>
            }
        />
        <Route path="/" element={<Navigate to="/login" replace/>}/>
      </Routes>
  )
}

export default App
