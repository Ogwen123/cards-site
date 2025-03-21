import { SH } from '../utils/storageHandler'

export function isLoggedIn() {
    if (SH.get("user")) {
        return true
    }
    return false
}

type Flag = "USER" | "ADMIN"

export function convertFlags(flag: number): string[] {
    const possibleFlags = {
        ADMIN: 1,
        USER: 2
    }
    let flags: Flag[] = []
    for (let i of (Object.keys(possibleFlags) as Flag[])) {
        const bw = possibleFlags[i] & flag
        if (bw === possibleFlags[i]) {
            flags.push(i)
        }
    }
    return flags
}