import express from 'express';
import generateController from '../controller/generate.js';


const router = express.Router();

router.post('/', generateController.generateAP)
router.post('/generateTreasuryClearing', generateController.generateTreasuryClearing)
router.post('/generateTreasuryClearing', generateController.generateAPSAP)


export default router
