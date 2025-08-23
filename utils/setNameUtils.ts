export default function transformSetName(setName: string): string {
  return setName
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/:/g, '')
    .replace(/\s+/g, '-');
}
