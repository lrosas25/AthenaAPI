import express from 'express';
import removeController from '../controller/removeData';

const router = express.Router();

router.post('/', removeController.removeDataInAp);

export default router;
