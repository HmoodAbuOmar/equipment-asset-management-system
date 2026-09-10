import './RecentAssets.css'

function RecentAssets({assets, userNames}) {
    return (
        <section className="recent-assets">
            <div className="dashboard-section-header">
                <h2>Recent Assets</h2>
                <button type="button">View All Assets</button>
            </div>

            <div className="recent-assets-table-wrapper">
                <table className="recent-assets-table">
                    <thead>
                    <tr>
                        <th>Asset Name</th>
                        <th>Category</th>
                        <th>Serial Number</th>
                        <th>Status</th>
                        <th>Current User</th>
                    </tr>
                    </thead>

                    <tbody>
                    {assets.map((asset) => (
                        <tr key={asset.id}>
                            <td>{asset.name}</td>
                            <td>{asset.category}</td>
                            <td>{asset.serialNumber}</td>

                            <td>
                                <span
                                    className={`asset-status ${asset.status.toLowerCase()}`}
                                >
                                    {asset.status.replaceAll('_', ' ')}
                                </span>
                            </td>

                            <td>
                                {asset.currentUserId
                                    ? userNames[asset.currentUserId] ??
                                    `User #${asset.currentUserId}`
                                    : '-'}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default RecentAssets