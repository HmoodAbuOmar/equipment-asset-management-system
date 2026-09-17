import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AssetsPage from './pages/AssetsPage.jsx'
import AssignmentsPage from './pages/AssignmentsPage.jsx'
import MaintenanceRequestsPage from './pages/MaintenanceRequestsPage.jsx'
import UsersPage from './pages/UsersPage.jsx'

import ChatbotPanel from './components/chatbot/ChatbotPanel.jsx'


function ProtectedLayout() {
    return (
        <ProtectedRoute>
            <>
                <Outlet />
                <ChatbotPanel />
            </>
        </ProtectedRoute>
    )
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/assignments" element={<AssignmentsPage />} />
                <Route path="/maintenance" element={<MaintenanceRequestsPage />} />
                <Route path="/users" element={<UsersPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}

export default App