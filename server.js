import express from "express"
import dotenv from "dotenv"
import cron from "node-cron"
import mongoose, { mongo } from "mongoose"
import { connectToDb } from "./config/dbconnection.js"
import generateRoutes from "./routes/generate.js"
import printDetailRoutes from "./routes/printDetails.js"
import removeRoutes from "./routes/removeData.js"
import { triggerGenerateAPApi } from "./helpers/triggerApi.js"
import authRoutes from "./routes/auth.js"
import { verifyToken } from "./middleware/verifyToken.js"
import cookieParser from "cookie-parser"
import treasuryClearingRoutes from "./routes/treasuryClearing.js"
import ApSapRoutes from "./routes/apSap.js"
import maintenanceValClRoutes from "./routes/maintenanceValCl.js"
import glDocTypeRoutes from "./routes/glDocType.js"
import ArchimedesRoutes from "./routes/archimedes.js"

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

cron.schedule('0,12,24 * * * *', () => {
    console.log('Running triggerGenerateAPApi');
    triggerGenerateAPApi();
});

//Routes
app.use("/v1/auth", authRoutes)
app.use("/v1/ap/generate", generateRoutes)
app.use("/v1/ap/remove", removeRoutes)
// app.use(verifyToken)
app.use("/v1/ap/printDetails", printDetailRoutes)
app.use("/v1/treasuryClearing/printDetails", treasuryClearingRoutes)
app.use("/v1/apSap/printDetails", ApSapRoutes)
app.use("/v1/archimedes/printDetails", ArchimedesRoutes)
app.use("/ValCl", maintenanceValClRoutes)
app.use("/glDocType", glDocTypeRoutes)

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB")
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})

