import express from 'express'
import generateController from '../controller/generate.js'
import printDetails from '../controller/printdetails.js'
const router = express.Router()

router.post('/sap/bkpf', generateController.generateSAPBKPF)
router.post('/sap/bseg', generateController.genereateSAPBSEG)
router.post('/sap/fb03', generateController.generateSAPFB03)
router.get('/sap/bkpf', printDetails.printDetailsSAPBKPF)
router.get('/sap/bseg', printDetails.printDetailsSAPBSEG)
router.get('/sap/fb03', printDetails.printDetailsSAPFB03)

export default router