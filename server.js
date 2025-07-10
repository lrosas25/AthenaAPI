import express from "express"
import dotenv from "dotenv"
import cron from "node-cron"
import { dirCheckFiles } from "./helpers/dirFilesChecker.js"
import mongoose, { mongo } from "mongoose"
import { connectToDb } from "./config/dbconnection.js"
import generateRoutes from "./routes/generate.js"
import printDetailRoutes from "./routes/printDetails.js"
import removeRoutes from "./routes/removeData.js"
import { triggerGenerateAPApi, triggerGenerateTreasuryApi, triggerGenerateAPSAPApi } from "./helpers/triggerApi.js"
import authRoutes from "./routes/auth.js"
import cookieParser from "cookie-parser"
import treasuryClearingRoutes from "./routes/treasuryClearing.js"
import ApSapRoutes from "./routes/apSap.js"
import maintenanceValClRoutes from "./routes/maintenanceValCl.js"
import glDocTypeRoutes from "./routes/glDocType.js"
import ArchimedesRoutes from "./routes/archimedes.js"
import rpaRoutes from "./routes/rpa.js"
import smsroute from "./routes/sms.js"

dotenv.config()

const app = express()
connectToDb()
app.use(express.urlencoded({ extended: "false" }))
app.use(cookieParser())
app.use(express.json())

// Schedule the triggerGenerateAPApi function to run every 8am and 8pm everyday
// 0, 8, 20 * * * means, 0 = minutes  -  8,20 Hour Field means run 8am and 8pm
//1st '*' is to set the day of the month 
//2nd '*' is to set the month to run the schedule
//3rd '*' is to set the week field
// '*' '*' '*' means to run every day
//cron.schedule('0 0,12 * * *', () => { 
cron.schedule('* * 1 * *', () => {
    const apDir = dirCheckFiles("./fileUploads/rpa/In/ap")
    const treasuryDir = dirCheckFiles("./fileUploads/rpa/In/treasury")
    const apSapDir = dirCheckFiles("./fileUploads/rpa/In/apSap")
    const bankStatementDir = dirCheckFiles("./fileUploads/rpa/In/bankstatement")
    const ClearingDir = dirCheckFiles("./fileUploads/rpa/In/clearing")

    if (apDir > 0) {
        triggerGenerateAPApi();
    }
    if (treasuryDir > 0) {
        triggerGenerateTreasuryApi()
    }
    if (apSapDir > 0) {
        triggerGenerateAPSAPApi()
    }
    if (bankStatementDir > 0) {
        triggerGenerateBankStatement()
    }
    if (ClearingDir > 0) {
        triggerGenerateClearing()
    }


});
//Routes
app.use("/auth", authRoutes)
app.use("/ap/generate", generateRoutes)
app.use("/ap/remove", removeRoutes)
// app.use(verifyToken)
app.use("/ap/printDetails", printDetailRoutes)
app.use("/treasuryClearing/printDetails", treasuryClearingRoutes)
app.use("/apSap/printDetails", ApSapRoutes)
app.use("/archimedes/printDetails", ArchimedesRoutes)
app.use("/ValCl", maintenanceValClRoutes)
app.use("/glDocType", glDocTypeRoutes)
app.use('/rpa', rpaRoutes)
app.use('/sms', smsroute)

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB")
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})

