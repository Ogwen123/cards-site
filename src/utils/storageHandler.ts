class StorageHandler {
    private privateLocalStorage: Storage;

    constructor() {
        this.privateLocalStorage = localStorage
        //@ts-ignore
        delete window.localStorage
    }

    public get(id: string): any {
        const data = this.privateLocalStorage.getItem(id)
        if (data === null) {
            return null
        } else {
            return JSON.parse(data)
        }
    }

    public set(id: string, data: { [key: string]: any }) {
        return this.privateLocalStorage.setItem(id, JSON.stringify(data))
    }

    public remove(id: string) {
        this.privateLocalStorage.removeItem(id)
    }

    public entries() {
        return Object.entries(this.privateLocalStorage)
    }
}

export const SH = new StorageHandler()