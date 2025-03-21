import config from "../config.json"

export function getApiUrl(): string {
    if (location.origin.startsWith("http://localhost") || location.origin.startsWith("http://127.0.0.1")) {
        return config.API_URL.DEV
    } else {
        return config.API_URL.PROD
    }
}