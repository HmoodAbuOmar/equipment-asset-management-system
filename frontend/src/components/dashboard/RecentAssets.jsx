import './RecentAssets.css'

function RecentAssets({assets, userNames, loading = false, unavailable = false}) {
    return (
        <section className="recent-assets">
            <div className="dashboard-section-header">
                <h2>Recent Assets</h2>
                <button type="button">View All Assets</button>
            </div>

            <div className="recent-assets-table-wrapper" role="region" aria-label="Recent assets, scroll horizontally on smaller screens" tabIndex={0}>
                <table className="recent-assets-table">
                    <thead>
                    <tr>
                        <th scope="col">Asset Name</th>
                        <th scope="col">Category</th>
                        <th scope="col">Serial Number</th>
                        <th scope="col">Status</th>
                        <th scope="col">Current User</th>
                    </tr>
                    </thead>

                    <tbody aria-busy={loading}>
                    {assets.length === 0 && <tr><td colSpan={5} className="dashboard-empty">
                        {loading ? 'Loading recent assets...' : unavailable ? 'Recent assets could not be loaded.' : 'No assets to display yet.'}
                    </td></tr>}
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