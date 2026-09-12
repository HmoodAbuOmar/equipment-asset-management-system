import {useEffect, useRef, useState} from 'react'
import {createMaintenanceRequest, getReportableAssets, resolveMaintenanceRequest} from '../../services/maintenanceService.js'
import {maintenanceErrorMessage} from './maintenanceUtils.js'

export default function MaintenanceDialog({action, identity, onClose, onSuccess, onUnauthorized}) {
    const dialogRef = useRef(null)
    const pendingRef = useRef(false)
    const [saving, setSaving] = useState(false)
    const [values, setValues] = useState({assetId: '', issueDescription: '', damaged: false})
    const [fieldErrors, setFieldErrors] = useState({})
    const [error, setError] = useState('')
    const [query, setQuery] = useState({page: 0})
    const [result, setResult] = useState(null)
    const creating = action.kind === 'create'
    const {employee, email} = identity

    useEffect(() => {
        const dialog = dialogRef.current
        dialog.showModal()
        return () => {
            dialog.close()
            const target = action.opener?.isConnected ? action.opener : document.querySelector('.maintenance-refresh')
            target?.focus()
        }
    }, [action])

    useEffect(() => {
        if (!creating) return
        const controller = new AbortController()
        async function load() {
            try {
                const data = await getReportableAssets({employee, email}, query.page, controller.signal)
                if (controller.signal.aborted) return
                const page = Math.max(0, Math.min(query.page, data.page.totalPages - 1))
                if (page !== query.page) setQuery({page})
                else setResult({query, data})
            } catch (error) {
                if (controller.signal.aborted) return
                if (error.status === 401) onUnauthorized()
                else setResult({query, error})
            }
        }
        load()
        return () => controller.abort()
    }, [creating, employee, email, query, onUnauthorized])

    const loading = creating && result?.query !== query
    const data = !loading && result?.data
    const loadError = !loading && result?.error

    function close() {
        if (!pendingRef.current) onClose()
    }

    function changePage(page) {
        setValues({...values, assetId: ''})
        setQuery({page})
    }

    async function submit(event) {
        event.preventDefault()
        if (pendingRef.current || (creating && !data)) return
        const errors = {}
        if (creating && !values.assetId) errors.assetId = 'Select an asset.'
        if (creating && !values.issueDescription.trim()) errors.issueDescription = 'Describe the issue.'
        setFieldErrors(errors)
        setError('')
        if (Object.keys(errors).length) {
            dialogRef.current.querySelector('[name="' + Object.keys(errors)[0] + '"]')?.focus()
            return
        }
        pendingRef.current = true
        setSaving(true)
        try {
            const saved = creating
                ? await createMaintenanceRequest({assetId: Number(values.assetId), issueDescription: values.issueDescription})
                : await resolveMaintenanceRequest(action.request.id, values.damaged)
            // A subsequent list refresh failure must not be reported as a failed mutation.
            pendingRef.current = false
            onSuccess(saved, creating ? 'reported' : 'resolved')
        } catch (failure) {
            if (failure.status === 401) onUnauthorized()
            else {
                setError(maintenanceErrorMessage(failure, true))
                setFieldErrors(failure.fieldErrors ?? {})
            }
            pendingRef.current = false
            setSaving(false)
        }
    }

    return <dialog className="maintenance-dialog" ref={dialogRef} aria-labelledby="maintenance-dialog-title" onCancel={(event) => {event.preventDefault(); close()}}>
        <div className="maintenance-dialog-heading">
            <h2 id="maintenance-dialog-title">{creating ? 'Report Maintenance Issue' : 'Resolve Request #' + action.request.id}</h2>
            <button type="button" aria-label="Close dialog" disabled={saving} onClick={close}>×</button>
        </div>
        {loading && <p role="status">Loading {employee ? 'your assigned' : 'available'} asset choices…</p>}
        {loadError && <div className="maintenance-error maintenance-message" role="alert">{maintenanceErrorMessage(loadError)} <button type="button" onClick={() => setQuery({...query})}>Retry</button></div>}
        {error && <p className="maintenance-error maintenance-message" role="alert">{error}</p>}
        <form onSubmit={submit} noValidate aria-busy={saving}>
            {creating && <>
                <p>{employee ? 'Report an issue with an asset currently assigned to you.' : 'Select the asset and describe what needs attention.'}</p>
                {data && <>
                    <label className="maintenance-field" htmlFor="maintenance-asset">Asset
                        <select id="maintenance-asset" name="assetId" required disabled={saving} value={values.assetId} aria-invalid={Boolean(fieldErrors.assetId)} aria-describedby={fieldErrors.assetId ? 'maintenance-asset-error' : undefined} onChange={(event) => setValues({...values, assetId: event.target.value})}>
                            <option value="">Select an asset</option>
                            {data.content.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} ({asset.serialNumber})</option>)}
                        </select>
                    </label>
                    {fieldErrors.assetId && <p id="maintenance-asset-error" className="maintenance-field-error" role="alert">{fieldErrors.assetId}</p>}
                    {!data.content.length && <p role="status">{employee ? 'You have no assigned assets to report.' : 'No assets are available to report.'}</p>}
                    {data.page.totalPages > 1 && <nav className="maintenance-option-pages" aria-label="Asset choices pagination">
                        <button type="button" disabled={saving || query.page === 0} onClick={() => changePage(query.page - 1)}>Previous assets</button>
                        <span>Page {query.page + 1} of {data.page.totalPages}</span>
                        <button type="button" disabled={saving || query.page + 1 >= data.page.totalPages} onClick={() => changePage(query.page + 1)}>Next assets</button>
                    </nav>}
                </>}
                <label className="maintenance-field" htmlFor="maintenance-issue">Issue description
                    <textarea id="maintenance-issue" name="issueDescription" rows={5} required disabled={saving} value={values.issueDescription} aria-invalid={Boolean(fieldErrors.issueDescription)} aria-describedby={fieldErrors.issueDescription ? 'maintenance-issue-error' : undefined} onChange={(event) => setValues({...values, issueDescription: event.target.value})}/>
                </label>
                {fieldErrors.issueDescription && <p id="maintenance-issue-error" className="maintenance-field-error" role="alert">{fieldErrors.issueDescription}</p>}
            </>}
            {!creating && <>
                <p className="maintenance-issue">{action.request.issueDescription}</p>
                <label className="maintenance-field" htmlFor="maintenance-outcome">Asset outcome
                    <select id="maintenance-outcome" disabled={saving} value={String(values.damaged)} onChange={(event) => setValues({...values, damaged: event.target.value === 'true'})}>
                        <option value="false">Repaired / working</option>
                        <option value="true">Damaged</option>
                    </select>
                </label>
                <p>{values.damaged ? 'The request will be resolved and the asset marked Damaged.' : 'The request will be resolved. The asset will return to Assigned if it has a current user, otherwise Available.'}</p>
            </>}
            <div className="maintenance-dialog-footer">
                <button type="button" disabled={saving} onClick={close}>Cancel</button>
                <button className="maintenance-primary" type="submit" disabled={saving || (creating && (!data || !data.content.length))}>{saving ? 'Saving…' : creating ? 'Report Issue' : 'Resolve Request'}</button>
            </div>
        </form>
    </dialog>
}
