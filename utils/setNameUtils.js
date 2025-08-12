export function transformSetName(setName) {
    return setName
        .toLowerCase()
        .replace(/'/g, '')
        .replace(/\s+/g, '-');
}