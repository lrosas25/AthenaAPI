import express from "express";
import openGRController from "../controller/OpenGR.js";
import authenticateBearerToken from "../middleware/bearerTokenAuth.js";

const router = express.Router();

// GET endpoint to process CSV file from shared network path and save to database
router.get(
  "/sap/opengr",
  authenticateBearerToken,
  openGRController.generateOpenGR
);

export default router;
