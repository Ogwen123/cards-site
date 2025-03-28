import React from 'react'
import { ShieldCheckIcon } from '@heroicons/react/20/solid'

interface UsernameProps {
    mode?: "CAMO" | "NORMAL",
    username: string,
    classname?: string,
    perms: string[],
    iconSize?: number
}

const Username = ({ mode = "NORMAL", username, classname, perms, iconSize = 5 }: UsernameProps) => {
    const newClassname = "flex items-center flex-row " + (classname ? classname : "")
    const newIconClassname = "h-" + iconSize + " w-" + iconSize + " text-admin"
    const [hasAdmin, setHasAdmin] = React.useState<boolean>(false)
    // check for admin
    React.useEffect(() => {
        if (perms.includes("ADMIN")) {
            setHasAdmin(true)
        }
    }, [])
    return (
        <div>
            {
                mode === "CAMO" ?
                    <div className={newClassname}>
                        <div className='text-textlight flex flex-row'>
                            {username}
                        </div>
                        {hasAdmin && <ShieldCheckIcon className={newIconClassname} title="Admin" style={{ marginLeft: Math.max(iconSize - 1, 0) + "px" }} />}
                    </div>
                    :
                    <div className={newClassname}>
                        <div>
                            {username}
                        </div>
                        {hasAdmin && <ShieldCheckIcon className={newIconClassname} title="Admin" style={{ marginLeft: iconSize + "px" }} />}
                    </div>
            }
        </div>
    )
}

export default Username