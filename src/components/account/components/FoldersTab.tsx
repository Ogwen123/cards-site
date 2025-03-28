import React from 'react'
import { User } from '../../../global/types'
import { alertReset } from '../../Alert'

interface FoldersTabProps {
    user: User,
    setAlertData: any
}

const FoldersTab = ({ user, setAlertData }: FoldersTabProps) => {

    React.useEffect(() => {
        setAlertData(alertReset) // ! remove
    }, [])

    return (
        <div>{user.id}</div>
    )
}

export default FoldersTab