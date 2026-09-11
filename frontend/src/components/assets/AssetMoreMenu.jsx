import {useId, useRef} from 'react'
import {MoreVertical} from 'lucide-react'

export default function AssetMoreMenu({asset, onDelete}) {
    const id = useId()
    const menu = useRef(null)
    const trigger = useRef(null)
    return <>
        <button ref={trigger} type="button" aria-label={`More options for ${asset.name}`} popoverTarget={id}
            onClick={() => {
                const rect = trigger.current.getBoundingClientRect()
                menu.current.style.left = `${Math.max(8, Math.min(rect.right - 150, window.innerWidth - 158))}px`
                menu.current.style.top = `${Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 64))}px`
            }}><MoreVertical size={16}/></button>
        <div ref={menu} id={id} popover="auto" className="assets-more-menu" aria-label={`Actions for ${asset.name}`}>
            <button type="button" onClick={() => {menu.current.hidePopover(); onDelete(trigger.current)}}>Delete Asset</button>
        </div>
    </>
}
