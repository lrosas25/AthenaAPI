export function dirCheckFiles(inputDir) {
    const files = fs.readdirSync(inputDir);
    return parseInt(files.length)
}