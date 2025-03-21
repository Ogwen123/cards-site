import React from 'react'
import { Navigate } from "react-router-dom"
import { convertFlags, isLoggedIn } from './utils/account'

type Condition = "LOGGED_IN" | "CARD_OWNER" | "NOT_LOGGED_IN"
type Perm = "USER" | "ADMIN"

interface RouteGuardProps {
    perm?: Perm,
    conditions: Condition[],
    page: React.ReactElement
}

const RouteGuard = ({ perm, conditions, page }: RouteGuardProps) => {
    const isAllowed = (): string => {
        if (conditions.includes("LOGGED_IN")) {
            if (isLoggedIn()) {
                return "allow"
            }
            return "/account/login"
        }
        if (conditions.includes("NOT_LOGGED_IN")) {
            if (!isLoggedIn()) {
                return "allow"
            }
            return "/account"
        }
        if (conditions.includes("CARD_OWNER")) {
            // check if the owner id of the card matches the logged in user
        }

        if (perm) {
            if (!convertFlags(JSON.parse(localStorage.getItem("user")!).flag).includes(perm)) {
                return "/"
            }
            return "allow"
        }
        return "allow"
    }

    const allowed = isAllowed()

    if (allowed === "allow") {
        return (page)
    } else {
        return (<Navigate to={allowed} />)
    }
}

export default RouteGuard