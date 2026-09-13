import {useCallback, useEffect, useState} from 'react'
import {Plus, RefreshCw} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import Header from '../components/layout/Header.jsx'
import CreateUserDialog from '../components/users/CreateUserDialog.jsx'
import UserAssetsDialog from '../components/users/UserAssetsDialog.jsx'
import {canViewUserAssets, roleLabels, userRoles, userIdentity, userErrorMessage} from '../components/users/userUtils.js'
import {getUsersByRole} from '../services/userService.js'
import './UsersPage.css'

export default function UsersPage() {
    const navigate = useNavigate()
    const identity = userIdentity(sessionStorage.getItem('accessToken'))
    const [query, setQuery] = useState({role: 'EMPLOYEE'})
    const [result, setResult] = useState(null)
    const [action, setAction] = useState(null)
    const [success, setSuccess] = useState('')
    const expireSession = useCallback(() => {
        sessionStorage.removeItem('accessToken')
        navigate('/login', {replace: true})
    }, [navigate])
    useEffect(() => {
        const controller = new AbortController()
        async function load() {
            try {
                const data = await getUsersByRole(query.role, controller.signal)
                if (!controller.signal.aborted) setResult({query, data})
            } catch (error) {
                if (controller.signal.aborted) return
                if (error.status === 401) expireSession()
                else setResult({query, error})
            }
        }
        load()
        return () => controller.abort()
    }, [query, expireSession])
    const loading = result?.query !== query
    const error = !loading && result?.error
    const users = !loading && result?.data
    function created(user) {
        setAction(null)
        setSuccess(`${user.name} was created successfully.`)
        setQuery({role: user.role})
    }
    return <div className="users-page">
        <Sidebar/>
        <main className="users-main">
            <Header title="Users & Permissions" showUserActions={false}>
                {identity.create && <button className="users-primary" onClick={(event) => setAction({kind: 'create', opener: event.currentTarget})}><Plus size={18} aria-hidden="true"/> Create User</button>}
            </Header>
            <p className="users-session">Signed in as {identity.email || 'authenticated user'} · {identity.roles.map((role) => roleLabels[role]).join(', ') || 'Role unavailable'}</p>
            {success && <p className="users-message users-success" role="status">{success} {error && 'The list could not be refreshed. Retry below.'} <button onClick={() => setSuccess('')}>Dismiss</button></p>}
            <section className="users-panel" aria-label="Users">
                <div className="users-toolbar"><label htmlFor="users-role">Role <select id="users-role" value={query.role} onChange={(event) => setQuery({role: event.target.value})}>{userRoles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label><button disabled={loading} onClick={() => setQuery({...query})}><RefreshCw size={16} aria-hidden="true"/> Refresh</button></div>
                {loading && <p className="users-message" role="status">Loading users…</p>}
                {error && <p className="users-message users-error" role="alert">{userErrorMessage(error)} <button onClick={() => setQuery({...query})}>Retry</button></p>}
                {users && !users.length && <p className="users-message" role="status">No users found for {roleLabels[query.role]}.</p>}
                {users && users.length > 0 && <>
                    <div className="users-table-scroll" role="region" aria-label="Users table" tabIndex={0}><table className="users-table"><thead><tr>{['ID', 'Name', 'Email', 'Role', 'Assigned assets'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{users.map((user) => <tr key={user.id}><th scope="row">#{user.id}</th><td>{user.name}</td><td>{user.email}</td><td><span className="users-role-badge">{roleLabels[user.role] || user.role}</span></td><td>{canViewUserAssets(identity, user) ? <button aria-label={`View assets for ${user.name}`} onClick={(event) => setAction({kind: 'assets', user, opener: event.currentTarget})}>View assets</button> : <span className="users-muted">Own assets only</span>}</td></tr>)}</tbody></table></div>
                    <p className="users-message">{users.length} users</p>
                </>}
            </section>
            <section className="users-panel users-permissions" aria-labelledby="permissions-title">
                <h2 id="permissions-title">Role permissions</h2><p>User directory access is available to all signed-in users. Permissions are enforced by the server.</p>
                <div className="users-table-scroll" role="region" aria-label="Role permissions" tabIndex={0}><table className="users-table"><thead><tr><th scope="col">Role</th><th scope="col">Create users</th><th scope="col">View user assets</th></tr></thead><tbody>{userRoles.map((role) => <tr key={role}><th scope="row">{roleLabels[role]} <span className="users-muted">({role})</span></th><td>{['MANAGER', 'ADMIN'].includes(role) ? 'Yes — any role' : 'No'}</td><td>{role === 'EMPLOYEE' ? 'Own assets only' : 'All users'}</td></tr>)}</tbody></table></div>
                <p>Role changes and user deletion are not available. An Employee role restricts asset access to the signed-in user's own assets, including accounts with additional roles.</p>
            </section>
        </main>
        {action?.kind === 'create' && identity.create && <CreateUserDialog identity={identity} opener={action.opener} onClose={() => setAction(null)} onSuccess={created} onUnauthorized={expireSession}/>}
        {action?.kind === 'assets' && <UserAssetsDialog identity={identity} user={action.user} opener={action.opener} onClose={() => setAction(null)} onUnauthorized={expireSession}/>}
    </div>
}
