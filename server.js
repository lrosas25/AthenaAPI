import express from "express"
import dotenv from "dotenv"
import cron from "node-cron"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"

import { connectToDb } from "./config/dbconnection.js"
import { dirCheckFiles } from "./helpers/dirFilesChecker.js"
import {
  triggerGenerateAPApi,
  triggerGenerateTreasuryApi,
  triggerGenerateAPSAPApi,
  triggerGenerateBankStatement,
  triggerGenerateClearing
} from "./helpers/triggerApi.js"

import authRoutes from "./routes/auth.js"
import generateRoutes from "./routes/generate.js"
import removeRoutes from "./routes/removeData.js"
import printDetailRoutes from "./routes/printDetails.js"
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

// Middleware
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.json())


cron.schedule('0 * * * *', () => {
    if (dirCheckFiles("./fileUploads/rpa/In/ap") > 0) triggerGenerateAPApi()
    if (dirCheckFiles("./fileUploads/rpa/In/treasury") > 0) triggerGenerateTreasuryApi()
    if (dirCheckFiles("./fileUploads/rpa/In/apSap") > 0) triggerGenerateAPSAPApi()
    if (dirCheckFiles("./fileUploads/rpa/In/bankstatement") > 0) triggerGenerateBankStatement()
    if (dirCheckFiles("./fileUploads/rpa/In/clearing") > 0) triggerGenerateClearing()
})

// Routes
app.use("/auth", authRoutes)
app.use("/ap/generate", generateRoutes)
app.use("/ap/remove", removeRoutes)
app.use("/ap/printDetails", printDetailRoutes)
app.use("/treasuryClearing/printDetails", treasuryClearingRoutes)
app.use("/apSap/printDetails", ApSapRoutes)
app.use("/archimedes/printDetails", ArchimedesRoutes)
app.use("/ValCl", maintenanceValClRoutes)
app.use("/glDocType", glDocTypeRoutes)
app.use("/rpa", rpaRoutes)
app.use("/sms", smsroute)

// Start server after DB connection
mongoose.connection.once("open", () => {
  const PORT = process.env.PORT || 3000
  console.log("Connected to MongoDB")
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
})

