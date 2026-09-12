import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import {Navigate, Route, Routes} from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage  from './pages/DashboardPage.jsx'
import AssetsPage from './pages/AssetsPage.jsx'
import AssignmentsPage from './pages/AssignmentsPage.jsx'
import MaintenanceRequestsPage from './pages/MaintenanceRequestsPage.jsx'

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
        <Route
            path="/assignments"
            element={
                <ProtectedRoute>
                    <AssignmentsPage/>
                </ProtectedRoute>
            }
        />
        <Route path="/maintenance" element={<ProtectedRoute><MaintenanceRequestsPage/></ProtectedRoute>}/>
        <Route path="/" element={<Navigate to="/login" replace/>}/>
      </Routes>
  )
}

export default App
