import express from "express"
import printDetailsController from "../controller/printdetails.js"
import authenticateBearerToken from "../middleware/bearerTokenAuth.js"


const router = express.Router()

router.get("/", authenticateBearerToken, printDetailsController.printDetailsAP)


export default router;