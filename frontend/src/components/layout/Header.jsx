import {Bell, ChevronDown} from 'lucide-react'
import './Header.css'

function Header({title = 'Dashboard', showUserActions = true, children}) {
    return (
        <header className="app-header">
            <h1>{title}</h1>

            {showUserActions && <div className="header-actions">
                <button className="notification-button" type="button">
                    <Bell size={20}/>
                </button>

                <div className="header-user">
                    <div className="user-avatar">M</div>

                    <div className="user-info">
                        <strong>Mohammed Abu Omar</strong>
                        <span>Administrator</span>
                    </div>

                    <ChevronDown size={18}/>
                </div>
            </div>}
            {children}
        </header>
    )
}

export default Header
