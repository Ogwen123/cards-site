import React from 'react'
import { User } from '../../../global/types'
import { alertReset } from '../../Alert'

interface AccountTabProps {
    user: User,
    setAlertData: any
}

const AccountTab = ({ user, setAlertData }: AccountTabProps) => {

    React.useEffect(() => {
        setAlertData(alertReset) // ! remove
    }, [])

    return (
        <div>{JSON.stringify(user)}</div>
    )
}

export default AccountTab