import './StatCard.css'

function StatCard({icon, title, value, description, variant}) {
    return (
        <div className="stat-card">
            <div className={`stat-card-icon ${variant}`}>
                {icon}
            </div>

            <div className="stat-card-content">
                <p className="stat-card-title">{title}</p>
                <h2>{value}</h2>
                <span>{description}</span>
            </div>
        </div>
    )
}

export default StatCard