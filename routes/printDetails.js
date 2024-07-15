import express from "express"
import printDetailsController from "../controller/printdetails.js"


const router = express.Router()

router.get("/", printDetailsController.printDetailsAP)

export default router;