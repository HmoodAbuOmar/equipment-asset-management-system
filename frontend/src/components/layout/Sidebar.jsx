import {
    LayoutDashboard,
    Monitor,
    ClipboardList,
    Wrench,
    Users,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import './Sidebar.css'
import {NavLink, useNavigate} from 'react-router-dom'
import {useId, useRef, useState} from 'react'

function Sidebar() {
    const navigate = useNavigate()
    const [expanded, setExpanded] = useState(false)
    const navigationId = useId()
    const toggleRef = useRef(null)

    const handleLogout = () => {
        sessionStorage.removeItem('accessToken')
        navigate('/login', {replace: true})
    }

    const getLinkClassName = ({isActive}) =>
        isActive ? 'sidebar-link active' : 'sidebar-link'

    return (
        <aside className="sidebar" onKeyDown={(event) => {
            if (event.key === 'Escape' && expanded) {
                setExpanded(false)
                toggleRef.current?.focus()
            }
        }}>
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
                <button ref={toggleRef} className="sidebar-toggle" type="button"
                    aria-label={expanded ? 'Close navigation' : 'Open navigation'}
                    aria-expanded={expanded} aria-controls={navigationId}
                    onClick={() => setExpanded(!expanded)}>
                    {expanded ? <X size={22}/> : <Menu size={22}/>}
                </button>
            </div>

            <div id={navigationId} className={`sidebar-menu${expanded ? ' is-expanded' : ''}`}>
                <nav className="sidebar-nav" aria-label="Main navigation" onClick={(event) => {
                    if (event.target.closest('a')) setExpanded(false)
                }}>
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
            </div>
        </aside>
    )
}

export default Sidebar