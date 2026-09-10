import {
    LayoutDashboard,
    Monitor,
    ClipboardList,
    Wrench,
    Users,
    LogOut
} from 'lucide-react'
import './Sidebar.css'
import {NavLink, useNavigate} from 'react-router-dom'

function Sidebar() {
    const navigate = useNavigate()

    const handleLogout = () => {
        sessionStorage.removeItem('accessToken')
        navigate('/login', {replace: true})
    }

    const getLinkClassName = ({isActive}) =>
        isActive ? 'sidebar-link active' : 'sidebar-link'

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <Monitor size={24}/>
                </div>

                <div>
                    <h2>EAMS</h2>
                    <p>
                        Equipment &amp; Asset<br/>
                        Management System
                    </p>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    className={getLinkClassName}
                    to="/dashboard"
                >
                    <LayoutDashboard size={20}/>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    className={getLinkClassName}
                    to="/assets"
                >
                    <Monitor size={20}/>
                    <span>Assets</span>
                </NavLink>

                <NavLink
                    className={getLinkClassName}
                    to="/assignments"
                >
                    <ClipboardList size={20}/>
                    <span>Assignments</span>
                </NavLink>

                <NavLink
                    className={getLinkClassName}
                    to="/maintenance"
                >
                    <Wrench size={20}/>
                    <span>Maintenance Requests</span>
                </NavLink>

                <NavLink
                    className={getLinkClassName}
                    to="/users"
                >
                    <Users size={20}/>
                    <span>Users</span>
                </NavLink>
            </nav>

            <button
                className="sidebar-logout"
                type="button"
                onClick={handleLogout}
            >
                <LogOut size={20}/>
                <span>Logout</span>
            </button>
        </aside>
    )
}

export default Sidebar