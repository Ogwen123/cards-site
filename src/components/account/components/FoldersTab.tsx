import React from 'react'
import { User } from '../../../global/types'

interface FoldersTabProps {
    user: User,
    setAlertData: any
}

const FoldersTab = ({ user, setAlertData }: FoldersTabProps) => {

    React.useEffect(() => {
        setAlertData(["", false, "NONE"]) // ! remove
    }, [])

    return (
        <div>{user.id}</div>
    )
}

export default FoldersTab