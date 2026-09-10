import {Bell, ChevronDown} from 'lucide-react'
import './Header.css'

function Header() {
    return (
        <header className="app-header">
            <h1>Dashboard</h1>

            <div className="header-actions">
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
            </div>
        </header>
    )
}

export default Header