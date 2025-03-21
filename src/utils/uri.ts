export default class URI {
    uri: string
    params: { [key: string]: string } = {}
    constructor(uri: string) {
        this.uri = uri
        if (!uri.includes("?")) return
        for (let i of uri.split("?")[1].split("&")) {
            this.params[i.split("=")[0]] = decodeURIComponent(i.split("=")[1])
        }
    }

    public get(id: string): string | null {
        if (this.params.hasOwnProperty(id)) {
            return this.params[id]
        } else {
            return null
        }
    }

    public hasParams(params: string[] | null): boolean {
        if (params === null) {
            if (Object.keys(this.params).length === 0) {
                return false
            }
        } else {
            for (let i of params) {
                if (!Object.keys(this.params).includes(i)) {
                    return false
                }
            }
        }
        return true
    }
}