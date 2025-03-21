import React from 'react'
import { User } from '../../../global/types'

interface AccountTabProps {
    user: User,
    setAlertData: any
}

const AccountTab = ({ user, setAlertData }: AccountTabProps) => {

    React.useEffect(() => {
        setAlertData(["", false, "NONE"]) // ! remove
    }, [])

    return (
        <div>{JSON.stringify(user)}</div>
    )
}

export default AccountTab