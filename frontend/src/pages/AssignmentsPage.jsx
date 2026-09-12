import {useCallback, useEffect, useState} from 'react'
import {ChevronLeft, ChevronRight, ChevronsLeft, Funnel, Plus, RotateCcw, Search} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import Header from '../components/layout/Header.jsx'
import {createAssignment, getAssignmentEmployees, getAssignments, getAvailableAssets, returnAssignment} from '../services/assignmentService.js'
import {assignmentErrorMessage, assignmentPermissions} from '../components/assignments/assignmentUtils.js'
import './AssignmentsPage.css'

const initialFilters = {search: '', status: ''}

function formatDate(value) {
    return value ? new Intl.DateTimeFormat('en-GB', {day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC'}).format(new Date(value)) : '—'
}

function availablePage(requested, totalPages) {
    return Math.max(0, Math.min(requested, totalPages - 1))
}

function AssignmentsPage() {
    const [draft, setDraft] = useState(initialFilters)
    const [request, setRequest] = useState({...initialFilters, page: 0})
    const [result, setResult] = useState(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogData, setDialogData] = useState(null)
    const [dialogError, setDialogError] = useState(null)
    const [values, setValues] = useState({assetId: '', userId: ''})
    const [fieldErrors, setFieldErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [returningId, setReturningId] = useState(null)
    const [feedback, setFeedback] = useState(null)
    const navigate = useNavigate()
    const permissions = assignmentPermissions(sessionStorage.getItem('accessToken'))

    const expireSession = useCallback(() => {
        sessionStorage.removeItem('accessToken')
        navigate('/login', {replace: true})
    }, [navigate])

    useEffect(() => {
        const controller = new AbortController()
        async function load() {
            try {
                const data = await getAssignments(request, controller.signal)
                if (controller.signal.aborted) return
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
        if (!dialogOpen) return undefined
        const controller = new AbortController()
        async function loadOptions() {
            try {
                const [assets, users] = await Promise.all([getAvailableAssets(controller.signal), getAssignmentEmployees(controller.signal)])
                if (!controller.signal.aborted) setDialogData({assets: assets.content, users})
            } catch (error) {
                if (controller.signal.aborted) return
                if (error.status === 401) expireSession()
                else setDialogError(error)
            }
        }
        loadOptions()
        return () => controller.abort()
    }, [dialogOpen, expireSession])

    const loading = result?.request !== request
    const error = loading ? null : result?.error
    const data = loading || error ? null : result?.data
    const assignments = data?.content ?? []
    const page = data?.page
    const first = assignments.length ? page.number * page.size + 1 : 0
    const last = assignments.length ? first + assignments.length - 1 : 0
    const pageStart = page ? Math.max(0, Math.min(page.number - 1, page.totalPages - 3)) : 0
    const pageNumbers = Array.from({length: Math.min(3, page?.totalPages ?? 0)}, (_, index) => pageStart + index)
    const hasFilters = Boolean(request.search || request.status)

    function applyFilters(event) {
        event.preventDefault()
        setRequest({search: draft.search.trim(), status: draft.status, page: 0})
    }

    function closeDialog() {
        if (!saving) {
            setDialogOpen(false)
            setValues({assetId: '', userId: ''})
            setFieldErrors({})
        }
    }

    function openDialog() {
        setDialogData(null)
        setDialogError(null)
        setValues({assetId: '', userId: ''})
        setFieldErrors({})
        setDialogOpen(true)
    }

    async function submitAssignment(event) {
        event.preventDefault()
        const errors = {}
        if (!values.assetId) errors.assetId = 'Select an asset.'
        if (!values.userId) errors.userId = 'Select a user.'
        setFieldErrors(errors)
        if (Object.keys(errors).length || saving) return

        setSaving(true)
        try {
            const assignment = await createAssignment({assetId: Number(values.assetId), userId: Number(values.userId)})
            setFeedback({type: 'success', message: `${assignment.assetName} was assigned to ${assignment.userName}.`})
            setDialogOpen(false)
            setValues({assetId: '', userId: ''})
            setRequest({...request, page: 0})
        } catch (error) {
            if (error.status === 401) expireSession()
            else {
                setFieldErrors(error.fieldErrors)
                setDialogError(error)
            }
        } finally {
            setSaving(false)
        }
    }

    async function returnAsset(assignment) {
        if (returningId != null) return
        setReturningId(assignment.id)
        try {
            await returnAssignment(assignment.id)
            setFeedback({type: 'success', message: `${assignment.assetName} was marked as returned.`})
            setRequest({...request})
        } catch (error) {
            if (error.status === 401) expireSession()
            else setFeedback({type: 'error', message: assignmentErrorMessage(error, true)})
        } finally {
            setReturningId(null)
        }
    }

    return <div className="assignments-page">
        <Sidebar/>
        <main className="assignments-main">
            <Header title="Assignments" showUserActions={false}>
                {permissions.manage && <button className="assignments-add-button" type="button" onClick={openDialog}><Plus size={18} aria-hidden="true"/> Assign Asset</button>}
            </Header>

            {feedback && <div className={`assignments-feedback assignments-${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.message}<button type="button" onClick={() => setFeedback(null)}>Dismiss</button></div>}
            <section className="assignments-panel" aria-label="Asset assignments">
                <form className="assignments-filters" onSubmit={applyFilters}>
                    <div className="assignments-search"><Search size={18} aria-hidden="true"/><input type="search" aria-label="Search assignments" placeholder="Search assets or users..." value={draft.search} onChange={(event) => setDraft({...draft, search: event.target.value})}/></div>
                    <select aria-label="Assignment status" value={draft.status} onChange={(event) => setDraft({...draft, status: event.target.value})}><option value="">All Status</option><option value="ACTIVE">Active</option><option value="RETURNED">Returned</option></select>
                    <button className="assignments-filter-button" type="submit"><Funnel size={16} aria-hidden="true"/> Filter</button>
                </form>

                {loading && <p className="assignments-feedback" role="status">Loading assignments…</p>}
                {error && <div className="assignments-feedback assignments-error" role="alert">{assignmentErrorMessage(error)}<button type="button" onClick={() => setRequest({...request})}>Retry</button></div>}
                {data && assignments.length === 0 && <p className="assignments-feedback" role="status">{hasFilters ? 'No assignments match your search or filters.' : 'No assignments yet.'}</p>}
                <div className="assignments-table-scroll" role="region" aria-label="Assignments table, scroll horizontally on smaller screens" tabIndex={0}>
                    <table className="assignments-table">
                        <thead><tr>{['Asset Name', 'Serial Number', 'Assigned To', 'Assigned Date', 'Return Date', 'Status', 'Actions'].map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
                        <tbody>{assignments.map((assignment) => {
                            const active = !assignment.returnedAt
                            return <tr key={assignment.id}>
                                <th scope="row">{assignment.assetName}</th><td className="assignments-serial-number">{assignment.assetSerialNumber}</td><td>{assignment.userName}</td><td>{formatDate(assignment.assignedAt)}</td><td>{formatDate(assignment.returnedAt)}</td>
                                <td><span className={`assignments-status assignments-status--${active ? 'active' : 'returned'}`}>{active ? 'Active' : 'Returned'}</span></td>
                                <td>{permissions.manage && active && <button className="assignments-return-button" type="button" disabled={returningId === assignment.id} onClick={() => returnAsset(assignment)}><RotateCcw size={15} aria-hidden="true"/>{returningId === assignment.id ? 'Returning…' : 'Return'}</button>}</td>
                            </tr>
                        })}</tbody>
                    </table>
                </div>
                {page && <footer className="assignments-pagination"><span>Showing {first} to {last} of {page.totalElements}</span><nav aria-label="Assignments pagination">
                    <button type="button" aria-label="First page" disabled={page.number === 0 || !page.totalPages} onClick={() => setRequest({...request, page: 0})}><ChevronsLeft size={16}/></button><button type="button" aria-label="Previous page" disabled={page.number === 0 || !page.totalPages} onClick={() => setRequest({...request, page: page.number - 1})}><ChevronLeft size={16}/></button>
                    {pageNumbers.map((number) => <button key={number} className={number === page.number ? 'assignments-current-page' : undefined} type="button" aria-label={`Page ${number + 1}`} aria-current={number === page.number ? 'page' : undefined} disabled={number === page.number} onClick={() => setRequest({...request, page: number})}>{number + 1}</button>)}
                    <button type="button" aria-label="Next page" disabled={page.number + 1 >= page.totalPages} onClick={() => setRequest({...request, page: page.number + 1})}><ChevronRight size={16}/></button>
                </nav></footer>}
            </section>

            {dialogOpen && <div className="assignments-dialog-backdrop" role="presentation" onMouseDown={closeDialog}><form className="assignments-dialog" aria-labelledby="assign-asset-title" onSubmit={submitAssignment} onMouseDown={(event) => event.stopPropagation()}>
                <div className="assignments-dialog-heading"><h2 id="assign-asset-title">Assign Asset</h2><button type="button" aria-label="Close" disabled={saving} onClick={closeDialog}>×</button></div>
                <p>Select an available asset and the employee who will receive it.</p>
                {!dialogData && !dialogError && <p className="assignments-dialog-context" role="status">Loading available assets and employees…</p>}
                {dialogError && <div className="assignments-dialog-error" role="alert">{assignmentErrorMessage(dialogError, true)}</div>}
                {dialogData && <><label className="assignments-dialog-field">Asset<select aria-invalid={Boolean(fieldErrors.assetId)} value={values.assetId} onChange={(event) => setValues({...values, assetId: event.target.value})}><option value="">Select an asset</option>{dialogData.assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} ({asset.serialNumber})</option>)}</select>{fieldErrors.assetId && <span className="assignments-field-error">{fieldErrors.assetId}</span>}</label>
                <label className="assignments-dialog-field">Assign to<select aria-invalid={Boolean(fieldErrors.userId)} value={values.userId} onChange={(event) => setValues({...values, userId: event.target.value})}><option value="">Select an employee</option>{dialogData.users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select>{fieldErrors.userId && <span className="assignments-field-error">{fieldErrors.userId}</span>}</label>
                {!dialogData.assets.length && <p className="assignments-dialog-context">No available assets to assign.</p>}{!dialogData.users.length && <p className="assignments-dialog-context">No employees are available.</p>}</>}
                <div className="assignments-dialog-footer"><button type="button" disabled={saving} onClick={closeDialog}>Cancel</button><button className="assignments-save-button" type="submit" disabled={!dialogData || saving || !dialogData.assets.length || !dialogData.users.length}>{saving ? 'Assigning…' : 'Assign Asset'}</button></div>
            </form></div>}
        </main>
    </div>
}

export default AssignmentsPage
