import MaintenanceValCl from "../model/MaintenanceValCl.js"
import processAllCSVFiles from "../helpers/processCSVFiles.js";
const maintenanceVAlcl = {
    generateDataValCl: async (req, res) => {
        try {
            const inputDir = "./fileUploads/In/maintenanceValCl";
            const outDir = "./fileUploads/out/maintenanceValCl";
            const data = await processAllCSVFiles(inputDir, outDir, 3, 1)
            data.forEach(async (data) => {
                try {
                    const result = await MaintenanceValCl.create({
                        "chac": data["ChAc"],
                        "trs": data["Trs"],
                        "vgcd": data["VGCd"],
                        "am": data["AM"],
                        "valCl": data["ValCl"],
                        "glAcct": data["G/L Acct"]
                    })
                } catch (e) {
                    console.log(e.message)
                }
            })
        } catch (e) {
            res.status(400).json({ message: e.message })
        }
        return res.status(200).json({ message: "Data saved successfully." })
    }
}

export default maintenanceVAlcl