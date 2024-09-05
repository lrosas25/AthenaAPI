import processAllCSVFiles from "../helpers/processCSVFiles.js"
import glDocType from "../model/glDocType.js"
const glDocTypeController = {
    generateDocType: async (req, res) => {
        const inputDir = "./fileUploads/In/docType"
        const outputDir = "./fileUploads/out/docType"
        try {
            const data = await processAllCSVFiles(inputDir, outputDir, 0, 0)
            for (let i = 0; i < data.length; i++) {
                const record = data[i]
                const result = await glDocType.create({
                    "glcode": record["GL Code"],
                    "transactiondetails": record["Transaction Details"],
                    "documentType": record["Document Type"]
                })
            }
            return res.status(200).json({ message: "Successfully inserted the data." })
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }

    }
}
export default glDocTypeController