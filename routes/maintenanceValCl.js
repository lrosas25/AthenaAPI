import express from "express";
import maintenanceVAlcl from "../controller/maintenanceValCl.js";
import authenticateBearerToken from "../middleware/bearerTokenAuth.js";

const router = express.Router();
router.post("/maintenance", authenticateBearerToken, maintenanceVAlcl.generateDataValCl)

export default router