import express from 'express';
import generateController from '../controller/generate.js';
import authenticateBearerToken from '../middleware/bearerTokenAuth.js';



const router = express.Router();

router.post('/', generateController.generateAP)
router.post('/rpaap', generateController.generateAPAuto)
router.post('/generateTreasuryClearing', generateController.generateTreasuryClearing)
router.post('/generateTreasuryClearingRPA', generateController.generateTreasuryClearingAuto)
router.post('/generateAPSAP', generateController.generateAPSAP)
router.post('/generateAPSAPRPA', generateController.generateAPSAPAuto)

router.post('/archimedes', authenticateBearerToken, generateController.generateArchimedes)
router.post('/archimedeshistory', authenticateBearerToken, generateController.generateArchimedesHistory)
router.post('/generateBankStatement', authenticateBearerToken, generateController.generateBankStatement)

//generateArchimedesHistory

export default router
