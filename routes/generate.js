import express from 'express';
import generateController from '../controller/generate.js';


const router = express.Router();

router.post('/', generateController.generateAP)
router.post("/removeAp", generateController.removeDataInAp)


export default router
