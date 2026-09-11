
import {useCallback, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {getAssets, getAssetUserNames} from '../services/assetService.js'
import {ChevronLeft, ChevronRight, ChevronsLeft, Eye, Pencil, Plus, Search, Funnel} from 'lucide-react'
import Sidebar from '../components/layout/Sidebar.jsx'
import Header from '../components/layout/Header.jsx'
import AssetDialog from '../components/assets/AssetDialog.jsx'
import AssetMoreMenu from '../components/assets/AssetMoreMenu.jsx'
import {assetPermissions, availablePage} from '../components/assets/assetUtils.js'
import './AssetsPage.css'

const statusLabels = {
    AVAILABLE: 'Available',
    ASSIGNED: 'Assigned',
    UNDER_MAINTENANCE: 'Under Maintenance',
    DAMAGED: 'Damaged',
}

const initialFilters = {search: '', status: '', category: ''}

function AssetsPage() {
    const navigate = useNavigate()
    const [draft, setDraft] = useState(initialFilters)
    const [request, setRequest] = useState({...initialFilters, page: 0})
    const [result, setResult] = useState(null)
    const [users, setUsers] = useState({names: {}, failed: false, denied: false})
    const [userAttempt, setUserAttempt] = useState(0)
    const [action, setAction] = useState(null)
    const [feedback, setFeedback] = useState('')
    const permissions = assetPermissions(sessionStorage.getItem('accessToken'))
    const expireSession = useCallback(() => {
        sessionStorage.removeItem('accessToken')
        navigate('/login', {replace: true})
    }, [navigate])

    useEffect(() => {
        const controller = new AbortController()
        async function load() {
            try {
                const data = await getAssets(request, controller.signal)
                if (controller.signal.aborted) return
                // A page may disappear while inventory changes between requests.
                if (request.page !== availablePage(request.page, data.page.totalPages)) {
                    setRequest({...request, page: availablePage(request.page, data.page.totalPages)})
                    return
                }
                setResult({request, data})
            } catch (error) {
                if (controller.signal.aborted) return
                if (error.status === 401) {
                    expireSession()
                    return
                }
                setResult({request, error})
            }
        }
        load()
        return () => controller.abort()
    }, [request, expireSession])

    useEffect(() => {
        const controller = new AbortController()
        async function loadNames() {
            try {
                const lookup = await getAssetUserNames(controller.signal)
                if (!controller.signal.aborted) setUsers(lookup)
            } catch (error) {
                if (controller.signal.aborted) return
                if (error.status === 401) {
                    expireSession()
                    return
                }
                setUsers({names: {}, failed: true, denied: error.status === 403})
            }
        }
        loadNames()
        return () => controller.abort()
    }, [expireSession, userAttempt])

    const loading = result?.request !== request
    const error = loading ? null : result?.error
    const data = loading || error ? null : result?.data
    const assets = data?.content ?? []
    const page = data?.page
    const hasFilters = Boolean(request.search || request.status || request.category)
    const first = assets.length ? page.number * page.size + 1 : 0
    const last = assets.length ? first + assets.length - 1 : 0
    const pageStart = page ? Math.max(0, Math.min(page.number - 1, page.totalPages - 3)) : 0
    const pageNumbers = Array.from({length: Math.min(3, page?.totalPages ?? 0)}, (_, index) => pageStart + index)

    function applyFilters(event) {
        event.preventDefault()
        setRequest({search: draft.search.trim(), status: draft.status, category: draft.category.trim(), page: 0})
    }

    function goToPage(number) {
        setRequest({...request, page: number})
    }

    function mutationSucceeded(kind) {
        setAction(null)
        setFeedback(kind === 'add' ? 'Asset created successfully.' : kind === 'edit' ? 'Asset updated successfully.' : 'Asset deleted successfully.')
        if (kind === 'add') {
            setDraft(initialFilters)
            setRequest({...initialFilters, page: 0})
        } else {
            setRequest({...request})
        }
    }

    return (
        <div className="assets-page">
            <Sidebar/>
            <main className="assets-main">
                <Header title="Assets" showUserActions={false}>
                    {permissions.create && <button className="assets-add-button" type="button" onClick={(event) => setAction({kind: 'add', opener: event.currentTarget})}>
                        <Plus size={18} aria-hidden="true"/> Add Asset
                    </button>}
                </Header>

                {feedback && <div className="assets-feedback assets-success" role="status">
                    {feedback} {error && 'The list could not be refreshed; retry below to see the latest assets.'}
                    <button type="button" onClick={() => setFeedback('')}>Dismiss</button>
                </div>}
                <section className="assets-panel" aria-label="Assets inventory">
                    <form className="assets-filters" onSubmit={applyFilters}>
                        <div className="assets-search">
                            <Search size={18} aria-hidden="true"/>
                            <input type="search" placeholder="Search assets..." aria-label="Search assets" value={draft.search} onChange={(event) => setDraft({...draft, search: event.target.value})}/>
                        </div>
                        <select aria-label="Asset status" value={draft.status} onChange={(event) => setDraft({...draft, status: event.target.value})}>
                            <option value="">All Status</option>
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <input className="assets-category" aria-label="Asset category" placeholder="All Categories" value={draft.category} onChange={(event) => setDraft({...draft, category: event.target.value})}/>
                        <button className="assets-filter-button" type="submit">
                            <Funnel size={16} aria-hidden="true"/> Filter
                        </button>
                    </form>

                    {users.failed && !error && <div className="assets-feedback" role="status">
                        {users.denied ? 'Access denied for some user names.' : 'Some user names could not be loaded.'} Assets remain available with user IDs.
                        <button type="button" onClick={() => setUserAttempt((attempt) => attempt + 1)}>Retry names</button>
                    </div>}
                    {loading && <p className="assets-feedback" role="status">Loading assets…</p>}
                    {error && <div className="assets-feedback assets-error" role="alert">
                        {error.status === 403 ? 'Access denied. You do not have permission to view assets.' : 'Unable to load assets. Please try again.'}
                        <button type="button" onClick={() => setRequest({...request})}>Retry</button>
                    </div>}
                    {data && assets.length === 0 && <p className="assets-feedback" role="status">
                        {hasFilters ? 'No assets match your search or filters.' : 'No assets yet.'}
                    </p>}

                    <div className="assets-table-scroll" role="region" aria-label="Assets table, scroll horizontally on smaller screens" tabIndex={0}>
                        <table className="assets-table">
                            <thead>
                            <tr>
                                {['Asset Name', 'Category', 'Serial Number', 'Status', 'Current User', 'Actions'].map((column) => (
                                    <th key={column} scope="col">{column}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {assets.map((asset) => (
                                <tr key={asset.id}>
                                    <th scope="row">{asset.name}</th>
                                    <td>{asset.category}</td>
                                    <td className="assets-serial-number">{asset.serialNumber}</td>
                                    <td><span className={`assets-status assets-status--${asset.status.toLowerCase()}`}>{statusLabels[asset.status]}</span></td>
                                    <td>{asset.currentUserId == null ? '—' : users.names[asset.currentUserId] || `User #${asset.currentUserId}`}</td>
                                    <td>
                                        <div className="assets-row-actions">
                                            {permissions.view && <button type="button" aria-label={`View ${asset.name}`} onClick={(event) => setAction({kind: 'view', asset, opener: event.currentTarget})}><Eye size={16}/></button>}
                                            {permissions.edit && <button type="button" aria-label={`Edit ${asset.name}`} onClick={(event) => setAction({kind: 'edit', asset, opener: event.currentTarget})}><Pencil size={16}/></button>}
                                            {permissions.delete && <AssetMoreMenu asset={asset} onDelete={(opener) => setAction({kind: 'delete', asset, opener})}/> }
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {page && <footer className="assets-pagination">
                        <span>Showing {first} to {last} of {page.totalElements}</span>
                        <nav aria-label="Assets pagination">
                            <button type="button" aria-label="First page" disabled={page.number === 0 || !page.totalPages} onClick={() => goToPage(0)}><ChevronsLeft size={16}/></button>
                            <button type="button" aria-label="Previous page" disabled={page.number === 0 || !page.totalPages} onClick={() => goToPage(page.number - 1)}><ChevronLeft size={16}/></button>
                            {pageNumbers.map((number) => <button key={number} className={number === page.number ? 'assets-current-page' : undefined} type="button" aria-label={`Page ${number + 1}`} aria-current={number === page.number ? 'page' : undefined} disabled={number === page.number} onClick={() => goToPage(number)}>{number + 1}</button>)}
                            <button type="button" aria-label="Next page" disabled={page.number + 1 >= page.totalPages} onClick={() => goToPage(page.number + 1)}><ChevronRight size={16}/></button>
                        </nav>
                    </footer>}

                </section>
                {action && <AssetDialog action={action} userNames={users.names} onClose={() => setAction(null)} onSuccess={mutationSucceeded} onUnauthorized={expireSession}/>}
            </main>
        </div>
    )
}

export default AssetsPage
