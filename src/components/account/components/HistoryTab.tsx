//import React from 'react'
import React from 'react'
import { User } from '../../../global/types'

interface HistoryTabProps {
    user: User,
    setAlertData: any
}

const HistoryTab = ({ user, setAlertData }: HistoryTabProps) => {

    React.useEffect(() => {
        setAlertData(["", false, "NONE"]) // ! remove
    }, [])

    return (
        <div>{user.id}</div>
    )
}

export default HistoryTab