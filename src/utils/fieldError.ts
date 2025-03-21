export class FieldErrors {
    private errors: { [key: string]: string } = {}

    public add(field: string, error: string) {
        this.errors[field] = error
    }

    public get(field: string): string {
        return this.errors[field]
    }

    public set(errors: { [key: string]: string }) {
        this.errors = errors
    }

    public set_array(errors: {field: string, message: string}[]) {
        errors.forEach((error) => {
            this.errors[error.field] = error.message
        })
    }

    public clear() {
        this.errors = {}
    }
}