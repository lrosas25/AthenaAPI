import express from "express";
import openGRController from "../controller/OpenGR.js";
import authenticateBearerToken from "../middleware/bearerTokenAuth.js";

const router = express.Router();

// POST endpoint to process CSV file from shared network path and save to database
router.post(
  "/sap/opengr",
  authenticateBearerToken,
  openGRController.generateOpenGR
);

export default router;
