export function title(str: string) {
    let newStr = ""
    for (let i of str.split(" ")) {
        newStr += (i[0].toUpperCase() + i.substring(1) + " ")
    }
    return newStr.trim()
}