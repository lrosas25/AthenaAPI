import express from 'express';
import printDetails from '../controller/printdetails.js';
import authenticateBearerToken from '../middleware/bearerTokenAuth.js';

const router = express.Router();
router.get("/", authenticateBearerToken, printDetails.printDetailsArchimedes);
//router.get("/includehistory", authenticateBearerToken, printDetails.printDetailsArchimedesWH);


export default router