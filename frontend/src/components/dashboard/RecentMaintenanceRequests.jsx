import {Wrench} from 'lucide-react'
import './RecentMaintenanceRequests.css'

function RecentMaintenanceRequests({
                                       requests,
                                       assetNames,
                                       userNames
                                   }) {
    return (
        <section className="recent-maintenance">
            <div className="dashboard-section-header">
                <h2>Recent Maintenance Requests</h2>
                <button type="button">View All</button>
            </div>

            <div className="maintenance-list">
                {requests.map((request) => (
                    <div
                        className="maintenance-item"
                        key={request.id}
                    >
                        <div className="maintenance-icon">
                            <Wrench size={18}/>
                        </div>

                        <div className="maintenance-info">
                            <strong>
                                {request.issueDescription}
                            </strong>

                            <span>
                                Asset: {
                                assetNames[request.assetId] ??
                                `#${request.assetId}`
                            }
                            </span>

                            <span>
                                Reported by: {
                                userNames[request.reportedById] ??
                                `User #${request.reportedById}`
                            }
                            </span>
                        </div>

                        <span
                            className={
                                `maintenance-status ${request.status.toLowerCase()}`
                            }
                        >
                            {request.status.replaceAll('_', ' ')}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default RecentMaintenanceRequests