import {useCallback, useEffect, useRef, useState} from 'react'
import {ChevronLeft, ChevronRight, Plus, RefreshCw, Play, CircleCheck} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import Header from '../components/layout/Header.jsx'
import MaintenanceDialog from '../components/maintenance/MaintenanceDialog.jsx'
import {maintenanceIdentity, maintenanceErrorMessage} from '../components/maintenance/maintenanceUtils.js'
import {getMaintenanceRequests, getMaintenanceNames, startMaintenanceRequest} from '../services/maintenanceService.js'
import './MaintenanceRequestsPage.css'

const statusLabels = {OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved'}
const emptyNames = {assets: {}, users: {}, failed: false}

function formatDate(value) {
    if (!value || Number.isNaN(new Date(value).getTime())) return '—'
    return new Intl.DateTimeFormat('en-GB', {dateStyle: 'medium', timeStyle: 'short'}).format(new Date(value))
}

export default function MaintenanceRequestsPage() {
    const navigate = useNavigate()
    const identity = maintenanceIdentity(sessionStorage.getItem('accessToken'))
    const [query, setQuery] = useState({page: 0})
    const [result, setResult] = useState(null)
    const [names, setNames] = useState(null)
    const [action, setAction] = useState(null)
    const [feedback, setFeedback] = useState(null)
    const [startingId, setStartingId] = useState(null)
    const pendingRef = useRef(false)
    const expireSession = useCallback(() => {
        sessionStorage.removeItem('accessToken')
        navigate('/login', {replace: true})
    }, [navigate])

    useEffect(() => {
        if (!identity.view) return
        const controller = new AbortController()
        async function load() {
            try {
                const data = await getMaintenanceRequests(query, controller.signal)
                if (controller.signal.aborted) return
                const page = Math.max(0, Math.min(query.page, data.page.totalPages - 1))
                if (page !== query.page) {
                    setQuery({page})
                    return
                }
                setResult({query, data})
                if (!data.content.length) return
                const lookup = await getMaintenanceNames(data.content, controller.signal)
                if (!controller.signal.aborted) setNames({query, ...lookup})
            } catch (error) {
                if (controller.signal.aborted) return
                if (error.status === 401) expireSession()
                else setResult({query, error})
            }
        }
        load()
        return () => controller.abort()
    }, [query, identity.view, expireSession])

    const loading = identity.view && result?.query !== query
    const error = !loading && result?.error
    const data = !loading && !error && result?.data
    const lookup = names?.query === query ? names : emptyNames
    const requests = data?.content ?? []
    const page = data?.page
    const first = requests.length ? page.number * page.size + 1 : 0
    const last = requests.length ? first + requests.length - 1 : 0

    function mutationSucceeded(saved, verb) {
        setAction(null)
        setFeedback({type: 'success', message: 'Request #' + saved.id + ' ' + verb + ' successfully.'})
        setQuery((current) => ({page: verb === 'reported' ? 0 : current.page}))
    }

    async function start(request) {
        if (pendingRef.current || !identity.manage || request.status !== 'OPEN') return
        pendingRef.current = true
        setStartingId(request.id)
        try {
            const saved = await startMaintenanceRequest(request.id)
            mutationSucceeded(saved, 'started')
        } catch (error) {
            if (error.status === 401) expireSession()
            else setFeedback({type: 'error', message: maintenanceErrorMessage(error, true)})
        } finally {
            pendingRef.current = false
            setStartingId(null)
        }
    }

    return <div className="maintenance-page">
        <Sidebar/>
        <main className="maintenance-main">
            <Header title="Maintenance Requests" showUserActions={false}>
                {identity.create && <button className="maintenance-primary" type="button" onClick={(event) => setAction({kind: 'create', opener: event.currentTarget})}><Plus size={18} aria-hidden="true"/> Report Issue</button>}
            </Header>
            {feedback && <div className={'maintenance-message maintenance-' + feedback.type} role={feedback.type === 'error' ? 'alert' : 'status'}>
                {feedback.message} {feedback.type === 'success' && error && 'The list could not be refreshed. Retry below to see the latest requests.'}
                <button type="button" onClick={() => setFeedback(null)}>Dismiss</button>
            </div>}
            {!identity.view && <section className="maintenance-panel maintenance-message">
                {identity.create ? 'You can report issues for your assigned assets. Request history is available to administrators, managers, and IT Support.' : 'You do not have permission to access maintenance requests.'}
            </section>}
            {identity.view && <section className="maintenance-panel" aria-label="Maintenance requests">
                <div className="maintenance-toolbar">
                    <p>Track reported issues and maintenance progress.</p>
                    <button className="maintenance-refresh" type="button" disabled={loading || startingId !== null} onClick={() => setQuery({...query})}><RefreshCw size={16} aria-hidden="true"/> Refresh</button>
                </div>
                {loading && <p className="maintenance-message" role="status">Loading maintenance requests…</p>}
                {error && <div className="maintenance-message maintenance-error" role="alert">{maintenanceErrorMessage(error)} <button type="button" onClick={() => setQuery({...query})}>Retry</button></div>}
                {lookup.failed && <p className="maintenance-message" role="status">Some names could not be loaded. IDs are shown instead. Use Refresh to retry.</p>}
                {data && !requests.length && <p className="maintenance-message" role="status">No maintenance requests yet.</p>}
                <div className="maintenance-table-scroll" role="region" aria-label="Maintenance table, scroll horizontally on smaller screens" tabIndex={0}>
                    <table className="maintenance-table">
                        <thead><tr>{['Request', 'Asset', 'Issue Description', 'Reported By', 'IT Handler', 'Request Date', 'Status', ...(identity.manage ? ['Actions'] : [])].map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
                        <tbody>{requests.map((request) => <tr key={request.id}>
                            <th scope="row">#{request.id}</th>
                            <td>{lookup.assets[request.assetId] || 'Asset #' + request.assetId}</td>
                            <td className="maintenance-issue">{request.issueDescription}</td>
                            <td>{lookup.users[request.reportedById] || 'User #' + request.reportedById}</td>
                            <td>{request.itHandlerId == null ? 'Unassigned' : lookup.users[request.itHandlerId] || 'User #' + request.itHandlerId}</td>
                            <td>{formatDate(request.requestDate)}</td>
                            <td><span className={'maintenance-status maintenance-status--' + request.status.toLowerCase()}>{statusLabels[request.status] || request.status}</span></td>
                            {identity.manage && <td>
                                {request.status === 'OPEN' && <button className="maintenance-action" type="button" disabled={startingId !== null} onClick={() => start(request)} aria-label={'Start request #' + request.id}><Play size={15} aria-hidden="true"/>{startingId === request.id ? 'Starting…' : 'Start'}</button>}
                                {request.status === 'IN_PROGRESS' && <button className="maintenance-action" type="button" disabled={startingId !== null} onClick={(event) => setAction({kind: 'resolve', request, opener: event.currentTarget})} aria-label={'Resolve request #' + request.id}><CircleCheck size={15} aria-hidden="true"/> Resolve</button>}
                                {request.status === 'RESOLVED' && '—'}
                            </td>}
                        </tr>)}</tbody>
                    </table>
                </div>
                {page && <footer className="maintenance-pagination">
                    <span>Showing {first} to {last} of {page.totalElements}</span>
                    <nav aria-label="Maintenance pagination">
                        <button type="button" aria-label="Previous page" disabled={page.number === 0 || startingId !== null} onClick={() => setQuery({page: page.number - 1})}><ChevronLeft size={16}/></button>
                        <span>Page {page.totalPages ? page.number + 1 : 0} of {page.totalPages}</span>
                        <button type="button" aria-label="Next page" disabled={page.number + 1 >= page.totalPages || startingId !== null} onClick={() => setQuery({page: page.number + 1})}><ChevronRight size={16}/></button>
                    </nav>
                </footer>}
            </section>}
            {action && <MaintenanceDialog action={action} identity={identity} onClose={() => setAction(null)} onSuccess={mutationSucceeded} onUnauthorized={expireSession}/>}
        </main>
    </div>
}
