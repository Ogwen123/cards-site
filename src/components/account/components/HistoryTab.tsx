//import React from 'react'
import React from 'react'
import { User } from '../../../global/types'
import { alertReset } from '../../Alert'

interface HistoryTabProps {
    user: User,
    setAlertData: any
}

const HistoryTab = ({ user, setAlertData }: HistoryTabProps) => {

    React.useEffect(() => {
        setAlertData(alertReset) // ! remove
    }, [])

    return (
        <div>{user.id}</div>
    )
}

export default HistoryTab