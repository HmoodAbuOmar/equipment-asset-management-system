import {useEffect, useRef, useState} from 'react'
import {createUser} from '../../services/userService.js'
import {roleLabels, userRoles, validateUser, userErrorMessage} from './userUtils.js'

export default function CreateUserDialog({identity, opener, onClose, onSuccess, onUnauthorized}) {
    const ref = useRef(null)
    const pending = useRef(false)
    const [saving, setSaving] = useState(false)
    const [values, setValues] = useState({name: '', email: '', password: '', role: 'EMPLOYEE'})
    const [errors, setErrors] = useState({})
    const [error, setError] = useState('')
    useEffect(() => {
        const dialog = ref.current
        dialog.showModal()
        return () => {dialog.close(); opener?.isConnected && opener.focus()}
    }, [opener])

    function close() {if (!pending.current) onClose()}
    async function submit(event) {
        event.preventDefault()
        if (pending.current || !identity.create) return
        const validation = validateUser(values)
        setErrors(validation)
        setError('')
        if (Object.keys(validation).length) {
            ref.current.querySelector(`[name="${Object.keys(validation)[0]}"]`)?.focus()
            return
        }
        pending.current = true
        setSaving(true)
        try {
            const user = await createUser(values)
            pending.current = false
            onSuccess(user)
        } catch (failure) {
            if (failure.status === 401) onUnauthorized()
            else {setError(userErrorMessage(failure, true)); setErrors(failure.fieldErrors ?? {})}
            pending.current = false
            setSaving(false)
        }
    }
    return <dialog ref={ref} className="users-dialog" aria-labelledby="create-user-title" onCancel={(event) => {event.preventDefault(); close()}}>
        <div className="users-dialog-heading"><h2 id="create-user-title">Create User</h2><button type="button" aria-label="Close dialog" disabled={saving} onClick={close}>×</button></div>
        {error && <p className="users-message users-error" role="alert">{error}</p>}
        <form onSubmit={submit} noValidate aria-busy={saving}>
            {['name', 'email', 'password', 'role'].map((field) => {
                const props = {id: `user-${field}`, name: field, required: true, disabled: saving, value: values[field], 'aria-invalid': Boolean(errors[field]), 'aria-describedby': errors[field] ? `user-${field}-error` : undefined, onChange: (event) => setValues({...values, [field]: event.target.value})}
                return <div key={field}>
                    <label className="users-field" htmlFor={props.id}>{field[0].toUpperCase() + field.slice(1)}
                        {field === 'role' ? <select {...props}>{userRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select>
                            : <input {...props} type={field === 'name' ? 'text' : field} autoComplete={field === 'password' ? 'new-password' : field} maxLength={{name: 100, email: 255, password: 72}[field]} minLength={field === 'password' ? 8 : undefined}/>}
                    </label>
                    {errors[field] && <p id={`user-${field}-error`} className="users-field-error" role="alert">{errors[field]}</p>}
                </div>
            })}
            <p>Password must contain 8–72 characters.</p>
            <div className="users-dialog-footer"><button type="button" disabled={saving} onClick={close}>Cancel</button><button className="users-primary" type="submit" disabled={saving || !identity.create}>{saving ? 'Creating…' : 'Create User'}</button></div>
        </form>
    </dialog>
}
