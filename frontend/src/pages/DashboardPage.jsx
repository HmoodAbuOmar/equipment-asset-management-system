import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {
    Package, CircleCheck, UserRound, Wrench, FileText
} from 'lucide-react'

import Sidebar from '../components/layout/Sidebar.jsx'
import Header from '../components/layout/Header.jsx'
import StatCard from '../components/dashboard/StatCard.jsx'
import RecentAssets from '../components/dashboard/RecentAssets.jsx'
import RecentMaintenanceRequests from '../components/dashboard/RecentMaintenanceRequests.jsx'

import {
    getAssets, getMaintenanceRequests, getAllUsers
} from '../services/dashboardService.js'

import './DashboardPage.css'

function DashboardPage() {
    const [totalAssets, setTotalAssets] = useState(null)
    const [availableAssets, setAvailableAssets] = useState(null)
    const [assignedAssets, setAssignedAssets] = useState(null)
    const [underMaintenance, setUnderMaintenance] = useState(null)
    const [openRequests, setOpenRequests] = useState(null)

    const [recentAssets, setRecentAssets] = useState([])
    const [recentMaintenanceRequests, setRecentMaintenanceRequests] = useState([])

    const [userNames, setUserNames] = useState({})
    const [assetNames, setAssetNames] = useState({})

    const navigate = useNavigate()
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadDashboard() {
            setError('')
            try {
                const [allAssetsData, availableAssetsData, assignedAssetsData, maintenanceAssetsData, maintenanceData, users] = await Promise.all([getAssets(null, 100), getAssets('AVAILABLE', 1), getAssets('ASSIGNED', 1), getAssets('UNDER_MAINTENANCE', 1), getMaintenanceRequests(100), getAllUsers()])

                setTotalAssets(allAssetsData.page.totalElements)
                setAvailableAssets(availableAssetsData.page.totalElements)
                setAssignedAssets(assignedAssetsData.page.totalElements)
                setUnderMaintenance(maintenanceAssetsData.page.totalElements)

                setRecentAssets(allAssetsData.content.slice(0, 5))

                const assetNameMap = Object.fromEntries(allAssetsData.content.map((asset) => [asset.id, asset.name]))

                setAssetNames(assetNameMap)

                const maintenanceRequests = maintenanceData.content

                setOpenRequests(maintenanceRequests.filter((request) => request.status === 'OPEN').length)

                setRecentMaintenanceRequests(maintenanceRequests.slice(0, 3))

                const userNameMap = Object.fromEntries(users.map((user) => [user.id, user.name]))

                setUserNames(userNameMap)
            } catch (error) {
                if (error.status === 401) {
                    sessionStorage.removeItem('accessToken')
                    navigate('/login', {replace: true})
                    return
                }

                console.error('Failed to load dashboard:', error)
                setError('Unable to load dashboard data. Please try again.')
            }
        }

        loadDashboard()
    }, [navigate])

    return (<div className="dashboard-page">
        <Sidebar/>

        <main className="dashboard-main">
            <Header/>
            {error && (<p className="dashboard-error" role="alert">
                    {error}
                </p>)}
            <section className="dashboard-stats">
                <StatCard
                    icon={<Package size={21}/>}
                    title="Total Assets"
                    value={totalAssets ?? '—'}
                    description="All assets in system"
                    variant="total"
                />

                <StatCard
                    icon={<CircleCheck size={21}/>}
                    title="Available Assets"
                    value={availableAssets ?? '—'}
                    description="Ready to assign"
                    variant="available"
                />

                <StatCard
                    icon={<UserRound size={21}/>}
                    title="Assigned Assets"
                    value={assignedAssets ?? '—'}
                    description="Currently assigned"
                    variant="assigned"
                />

                <StatCard
                    icon={<Wrench size={21}/>}
                    title="Under Maintenance"
                    value={underMaintenance ?? '—'}
                    description="In maintenance"
                    variant="maintenance"
                />

                <StatCard
                    icon={<FileText size={21}/>}
                    title="Open Requests"
                    value={openRequests ?? '—'}
                    description="Awaiting action"
                    variant="requests"
                />
            </section>

            <section className="dashboard-content">
                <RecentAssets
                    assets={recentAssets}
                    userNames={userNames}
                />
                <RecentMaintenanceRequests
                    requests={recentMaintenanceRequests}
                    assetNames={assetNames}
                    userNames={userNames}
                />
            </section>
        </main>
    </div>)
}

export default DashboardPage