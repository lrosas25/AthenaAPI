import express from "express";
import openGRController from "../controller/OpenGR.js";
import authenticateBearerToken from "../middleware/bearerTokenAuth.js";

const router = express.Router();

// POST endpoint to process CSV/text files and save to database
router.post(
  "/sap/opengr",
  authenticateBearerToken,
  openGRController.processOpenGR
);

// GET endpoint to retrieve OpenGR data with optional filters
router.get("/sap/opengr", authenticateBearerToken, openGRController.getOpenGR);

export default router;
