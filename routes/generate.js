import express from 'express';
import generateController from '../controller/generate.js';
import authenticateBearerToken from '../middleware/bearerTokenAuth.js';



const router = express.Router();

router.post('/', generateController.generateAP)
router.post('/generateTreasuryClearing', generateController.generateTreasuryClearing)
router.post('/generateAPSAP', generateController.generateAPSAP)
router.post('/archimedes', authenticateBearerToken, generateController.generateArchimedes)


export default router
