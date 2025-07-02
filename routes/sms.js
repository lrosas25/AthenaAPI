import express from 'express'
import smscontroller from '../controller/sms.js'

const router = express.Router()

router.get('/send', smscontroller.send)



export default router