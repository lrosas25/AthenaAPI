import express from 'express';
import { authController } from '../controller/auth.js';

const router = express.Router()

router.post('/', authController.login)
router.post("/register", authController.register)

export default router