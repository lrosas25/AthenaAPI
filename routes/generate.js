import express from 'express';
import generateController from '../controller/generate.js';
import authenticateBearerToken from '../middleware/bearerTokenAuth.js';



const router = express.Router();

router.post('/', authenticateBearerToken, generateController.generateAP)
router.post('/generateTreasuryClearing', authenticateBearerToken, generateController.generateTreasuryClearing)
router.post('/generateAPSAP', authenticateBearerToken, generateController.generateAPSAP)
router.post('/archimedes', authenticateBearerToken, generateController.generateArchimedes)


export default router
