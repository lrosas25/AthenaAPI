import express from 'express'
import generateController from '../controller/generate.js'
const router = express.Router()

router.post('/sap/bkpf', generateController.generateSAPBKPF)
router.post('/sap/bseg', generateController.genereateSAPBSEG)
router.post('/sap/fb03', generateController.generateSAPFB03)

export default router