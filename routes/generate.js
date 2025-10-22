// Default GET route
import express from 'express';
const router = express.Router();
import generateController from '../controller/generate.js';
import authenticateBearerToken from '../middleware/bearerTokenAuth.js';

router.get('/', (req, res) => {
  res.status(200).json({ message: 'AthenaAPI generate route is working.' });
});

// ...existing code...






router.post('/', generateController.generateAP)
router.post('/rpaap', generateController.generateAPAuto)
router.post('/generateTreasuryClearing', generateController.generateTreasuryClearing)
router.post('/generateTreasuryClearingRPA', generateController.generateTreasuryClearingAuto)
router.post('/generateAPSAP', generateController.generateAPSAP)
router.post('/generateAPSAPRPA', generateController.generateAPSAPAuto)

router.post('/archimedes', authenticateBearerToken, generateController.generateArchimedes)
router.post('/archimedeshistory', authenticateBearerToken, generateController.generateArchimedesHistory)
router.post('/generateBankStatement', authenticateBearerToken, generateController.generateBankStatement)
router.post('/generateClearing', authenticateBearerToken, generateController.generateClearing)

//generateArchimedesHistory

export default router
