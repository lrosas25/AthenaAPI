import express from 'express';
import glDocTypeController from '../controller/glDocType.js';

const router = express.Router();
router.post("/generateDocType", glDocTypeController.generateDocType)


export default router