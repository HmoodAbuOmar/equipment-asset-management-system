import {useEffect, useRef, useState} from 'react'
import {getUserAssets} from '../../services/userService.js'
import {canViewUserAssets, userErrorMessage} from './userUtils.js'

export default function UserAssetsDialog({user, identity, opener, onClose, onUnauthorized}) {
    const ref = useRef(null)
    const [query, setQuery] = useState({page: 0})
    const [result, setResult] = useState(null)
    const allowed = canViewUserAssets(identity, user)
    useEffect(() => {
        const dialog = ref.current
        dialog.showModal()
        return () => {dialog.close(); opener?.isConnected && opener.focus()}
    }, [opener])
    useEffect(() => {
        if (!allowed) return
        const controller = new AbortController()
        async function load() {
            try {
                const data = await getUserAssets(user.id, query.page, controller.signal)
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
    }, [user.id, query, allowed, onUnauthorized])
    const loading = allowed && result?.query !== query
    const data = !loading && result?.data
    const error = !loading && result?.error
    return <dialog ref={ref} className="users-dialog users-assets-dialog" aria-labelledby="user-assets-title" onCancel={(event) => {event.preventDefault(); onClose()}}>
        <div className="users-dialog-heading"><h2 id="user-assets-title">Assigned assets — {user.name}</h2><button type="button" aria-label="Close dialog" onClick={onClose}>×</button></div>
        <p>User #{user.id} · {user.email}</p>
        {!allowed && <p role="alert">You do not have permission to view these assets.</p>}
        {loading && <p role="status">Loading assigned assets…</p>}
        {error && <p className="users-message users-error" role="alert">{userErrorMessage(error)} <button onClick={() => setQuery({...query})}>Retry</button></p>}
        {data && <>
            {!data.content.length ? <p role="status">This user has no currently assigned assets.</p> : <div className="users-table-scroll" role="region" aria-label="Assigned assets" tabIndex={0}>
                <table className="users-table"><thead><tr>{['ID', 'Name', 'Category', 'Serial number', 'Status', 'Purchase date', 'Current user ID'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
                    <tbody>{data.content.map((asset) => <tr key={asset.id}><th scope="row">#{asset.id}</th><td>{asset.name}</td><td>{asset.category}</td><td>{asset.serialNumber}</td><td>{asset.status?.replaceAll('_', ' ')}</td><td>{asset.purchaseDate || '—'}</td><td>{asset.currentUserId ?? '—'}</td></tr>)}</tbody>
                </table>
            </div>}
            <nav className="users-pagination" aria-label="User assets pagination"><span>{data.page.totalElements} assets{data.page.totalPages > 0 && ` · Page ${data.page.number + 1} of ${data.page.totalPages}`}</span><button disabled={query.page === 0} onClick={() => setQuery({page: query.page - 1})}>Previous</button><button disabled={query.page + 1 >= data.page.totalPages} onClick={() => setQuery({page: query.page + 1})}>Next</button></nav>
        </>}
        <div className="users-dialog-footer"><button onClick={onClose}>Close</button></div>
    </dialog>
}
