import express from 'express'
import generateController from '../controller/generate.js'
import printDetails from '../controller/printdetails.js'
import authenticateBearerToken from '../middleware/bearerTokenAuth.js'
const router = express.Router()

router.post('/sap/bkpf', generateController.generateSAPBKPF)
router.post('/sap/bseg', generateController.genereateSAPBSEG)
router.post('/sap/fb03', generateController.generateSAPFB03)
router.get('/sap/bkpf', authenticateBearerToken, printDetails.printDetailsSAPBKPF)
router.get('/sap/bseg', authenticateBearerToken, printDetails.printDetailsSAPBSEG)
router.get('/sap/fb03', authenticateBearerToken, printDetails.printDetailsSAPFB03)
router.get('/sap/bankstatement', authenticateBearerToken, printDetails.printDetailsSAPBankStatement)

export default router