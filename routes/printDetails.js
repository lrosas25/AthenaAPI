import express from "express"
import printDetailsController from "../controller/printdetails.js"
import authenticateBearerToken from "../middleware/bearerTokenAuth.js"


const router = express.Router()

router.get("/", authenticateBearerToken, printDetailsController.printDetailsAP)
router.get("/POLineItem", authenticateBearerToken, printDetailsController.printDetailsPOLineItem)
router.get("/POTotal", authenticateBearerToken, printDetailsController.printDetailsQASPOTotal)


export default router;