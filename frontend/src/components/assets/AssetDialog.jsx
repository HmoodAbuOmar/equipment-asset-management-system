import {useEffect, useRef, useState} from 'react'
import {createAsset, deleteAsset, getAsset, updateAsset} from '../../services/assetService.js'
import {assetErrorMessage, deletionRestriction, todayDate, validateAsset} from './assetUtils.js'

export default function AssetDialog({action, userNames, onClose, onSuccess, onUnauthorized}) {
    const dialogRef = useRef(null)
    const pendingRef = useRef(false)
    const [saving, setSaving] = useState(false)
    const [attempt, setAttempt] = useState(0)
    const [loaded, setLoaded] = useState(null)
    const [loadError, setLoadError] = useState(null)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [values, setValues] = useState({name: '', category: '', serialNumber: '', purchaseDate: ''})
    const creating = action.kind === 'add'
    const editing = action.kind === 'edit'
    const deleting = action.kind === 'delete'
    const title = creating ? 'Add Asset' : editing ? 'Edit Asset' : deleting ? 'Delete Asset' : 'Asset Details'
    const asset = loaded
    const loading = !creating && !asset && !loadError
    const restriction = deleting && asset ? deletionRestriction(asset) : ''

    useEffect(() => {
        const dialog = dialogRef.current
        const opener = action.opener
        dialog.showModal()
        return () => {
            dialog.close()
            // Refresh or deletion can remove the original row action.
            const target = opener?.isConnected ? opener : document.querySelector('.assets-search input')
            target?.focus()
        }
    }, [action])

    useEffect(() => {
        if (creating) return
        const controller = new AbortController()
        async function load() {
            try {
                const data = await getAsset(action.asset.id, controller.signal)
                if (controller.signal.aborted) return
                setLoaded(data)
                setValues({name: data.name, category: data.category, serialNumber: data.serialNumber, purchaseDate: data.purchaseDate ?? ''})
            } catch (failure) {
                if (controller.signal.aborted) return
                if (failure.status === 401) onUnauthorized()
                else setLoadError(failure)
            }
        }
        load()
        return () => controller.abort()
    }, [action, creating, attempt, onUnauthorized])

    function close() {
        if (!pendingRef.current) onClose()
    }

    async function submit(event) {
        event.preventDefault()
        if ((!creating && !editing && !deleting) || pendingRef.current || restriction || (!creating && !asset)) return
        const errors = deleting ? {} : validateAsset(values, creating)
        if (!deleting && event.currentTarget.elements.purchaseDate.validity.badInput) {
            errors.purchaseDate = 'Enter a valid purchase date or leave it empty.'
        }
        setFieldErrors(errors)
        setError('')
        if (Object.keys(errors).length) {
            dialogRef.current.querySelector(`[name="${Object.keys(errors)[0]}"]`)?.focus()
            return
        }
        pendingRef.current = true
        setSaving(true)
        const body = {...values, name: values.name.trim(), category: values.category.trim(), serialNumber: values.serialNumber.trim(), purchaseDate: values.purchaseDate || null}
        try {
            if (creating) await createAsset(body)
            else if (editing) await updateAsset(asset.id, body)
            else if (deleting) await deleteAsset(asset.id)
        } catch (failure) {
            if (failure.status === 401) onUnauthorized()
            else {
                setError(assetErrorMessage(failure, true))
                setFieldErrors(creating && failure.status === 409
                    ? {serialNumber: failure.message}
                    : failure.fieldErrors ?? {})
            }
            pendingRef.current = false
            setSaving(false)
            return
        }
        // List refresh is independent: a refresh failure must not imply a failed write.
        pendingRef.current = false
        onSuccess(action.kind)
    }

    const fields = {name: 'Name', category: 'Category', ...(creating ? {serialNumber: 'Serial Number'} : {}), purchaseDate: 'Purchase Date (optional)'}

    return <dialog className="assets-dialog" ref={dialogRef} aria-labelledby="assets-dialog-title" onCancel={(event) => {event.preventDefault(); close()}}>
        <div className="assets-dialog-heading">
            <h2 id="assets-dialog-title">{title}</h2>
            <button type="button" aria-label="Close dialog" disabled={saving} onClick={close}>×</button>
        </div>
        {loading && <p role="status">Loading asset details…</p>}
        {loadError && <div className="assets-dialog-error" role="alert">
            <p>{assetErrorMessage(loadError)}</p>
            <button type="button" onClick={() => {setLoadError(null); setAttempt((value) => value + 1)}}>Retry</button>
        </div>}
        {error && <p className="assets-dialog-error" role="alert">{error}</p>}
        {(creating || asset) && <form onSubmit={submit} noValidate aria-busy={saving}>
            {(creating || editing) && <>
                {editing && <p className="assets-dialog-context">Serial Number: {asset.serialNumber} (cannot be changed)</p>}
                {Object.entries(fields).map(([name, label]) => <div className="assets-dialog-field" key={name}>
                    <label htmlFor={`assets-${name}`}>{label}</label>
                    <input id={`assets-${name}`} name={name} type={name === 'purchaseDate' ? 'date' : 'text'} value={values[name]}
                        required={name !== 'purchaseDate'} maxLength={name === 'purchaseDate' ? undefined : 100} max={name === 'purchaseDate' ? todayDate() : undefined}
                        disabled={saving} aria-invalid={Boolean(fieldErrors[name])} aria-describedby={fieldErrors[name] ? `assets-${name}-error` : undefined}
                        onChange={(event) => setValues({...values, [name]: event.target.value})}/>
                    {fieldErrors[name] && <span className="assets-field-error" id={`assets-${name}-error`} role="alert">{fieldErrors[name]}</span>}
                </div>)}
            </>}
            {deleting && <>
                <p>Delete <strong>{asset.name}</strong> ({asset.serialNumber})? This cannot be undone.</p>
                {restriction && <p className="assets-dialog-error">{restriction}</p>}
            </>}
            {!creating && !editing && !deleting && <dl className="assets-details">
                {Object.entries({ID: asset.id, Name: asset.name, Category: asset.category, 'Serial Number': asset.serialNumber,
                    Status: asset.status.replaceAll('_', ' '), 'Purchase Date': asset.purchaseDate ?? '—',
                    'Current User': asset.currentUserId == null ? '—' : userNames[asset.currentUserId] || `User #${asset.currentUserId}`,
                }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>}
            <div className="assets-dialog-footer">
                <button type="button" disabled={saving} onClick={close}>{creating || editing || deleting ? 'Cancel' : 'Close'}</button>
                {(creating || editing || deleting) && <button className={deleting ? 'assets-danger-button' : 'assets-save-button'} type="submit" disabled={saving || Boolean(restriction)}>
                    {saving ? (deleting ? 'Deleting…' : 'Saving…') : deleting ? 'Delete Asset' : creating ? 'Add Asset' : 'Save Changes'}
                </button>}
            </div>
        </form>}
    </dialog>
}
