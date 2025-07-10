import express from 'express';
import removeController from '../controller/removeData.js';

const router = express.Router();

router.post('/', removeController.removeDataInAp);

export default router;
