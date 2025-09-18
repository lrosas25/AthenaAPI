import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import processAllCSVFiles from "../helpers/processCSVFiles.js";
import OpenGR from "../model/OpenGR/OpenGR.js";

const openGRController = {
  generateOpenGR: async (req, res) => {
    const inputDir = "./fileUploads/SAP/DEVQAS_GRIR/DOWNLOAD/IN"; // "in" folder for CSV/text files to be processed
    const outputDir = "./fileUploads/SAP/DEVQAS_GRIR/DOWNLOAD/OUT"; // "out" folder for processed files

    try {
      // Step 1: Check if input directory exists and find the latest CSV or text file
      if (!fs.existsSync(inputDir)) {
        return res
          .status(400)
          .json({ message: "Input directory does not exist." });
      }

      const files = fs.readdirSync(inputDir);
      const validFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ext === ".csv" || ext === ".txt";
      });

      if (validFiles.length === 0) {
        return res
          .status(400)
          .json({ message: "No CSV or text files found in the directory." });
      }

      // Get the latest file based on modification time
      let latestFile;
      try {
        latestFile = validFiles
          .map((file) => ({
            name: file,
            path: path.join(inputDir, file),
            mtime: fs.statSync(path.join(inputDir, file)).mtime,
          }))
          .sort((a, b) => b.mtime - a.mtime)[0];
      } catch (statError) {
        return res.status(500).json({
          message: "Error accessing file information: " + statError.message,
        });
      }

      // Additional safety check to ensure latestFile is defined
      if (!latestFile) {
        return res
          .status(400)
          .json({ message: "No valid files could be processed." });
      }

      console.log(`Processing latest file: ${latestFile.name}`);

      // Create a temporary directory with only the latest file to use with existing helper
      const tempInputDir = path.join(inputDir, "../temp_input");
      try {
        if (!fs.existsSync(tempInputDir)) {
          fs.mkdirSync(tempInputDir, { recursive: true });
        }
      } catch (mkdirError) {
        return res.status(500).json({
          message: "Error creating temporary directory: " + mkdirError.message,
        });
      }

      // Copy the latest file to temp directory
      // If it's a .txt file, rename it to .csv so the helper can process it
      const fileExt = path.extname(latestFile.name).toLowerCase();
      const fileName =
        fileExt === ".txt"
          ? latestFile.name.replace(/\.txt$/i, ".csv")
          : latestFile.name;

      const tempFilePath = path.join(tempInputDir, fileName);
      try {
        fs.copyFileSync(latestFile.path, tempFilePath);
      } catch (copyError) {
        // Clean up temp directory before returning error
        try {
          fs.rmSync(tempInputDir, { recursive: true, force: true });
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        return res.status(500).json({
          message:
            "Error copying file to temporary directory: " + copyError.message,
        });
      }

      // Step 2: Process the latest file using the existing helper
      let data;
      try {
        data = await processAllCSVFiles(tempInputDir, outputDir, 0, 0, true);
      } catch (processError) {
        // Clean up temp directory before returning error
        try {
          fs.rmSync(tempInputDir, { recursive: true, force: true });
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        return res.status(400).json({
          message: "Error processing CSV file: " + processError.message,
        });
      }

      // Clean up temp directory
      try {
        fs.rmSync(tempInputDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn(
          "Warning: Could not clean up temp directory:",
          cleanupError.message
        );
        // Don't fail the request for cleanup errors, just log it
      }

      if (!data || data.length === 0) {
        return res
          .status(400)
          .json({ message: "No data found in the CSV folder." });
      }

      // Step 3: Clean up output folder to keep only the latest processed file
      // Ensure output directory exists
      try {
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
      } catch (outputDirError) {
        return res.status(500).json({
          message: "Error creating output directory: " + outputDirError.message,
        });
      }

      // Get all files currently in output folder
      let outputFiles;
      try {
        outputFiles = fs.readdirSync(outputDir);
      } catch (readOutputError) {
        console.warn(
          "Warning: Could not read output directory:",
          readOutputError.message
        );
        outputFiles = []; // Continue with empty array
      }

      // Find the processed file that was just moved by the helper (should match the original filename)
      const processedFileName =
        fileExt === ".txt"
          ? latestFile.name.replace(/\.txt$/i, ".csv")
          : latestFile.name;

      // Remove all files except the one we just processed
      outputFiles.forEach((file) => {
        if (file !== processedFileName) {
          const filePath = path.join(outputDir, file);
          try {
            if (fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
            }
          } catch (deleteError) {
            console.warn(
              `Warning: Could not delete file ${file}:`,
              deleteError.message
            );
            // Continue processing even if file deletion fails
          }
        }
      });

      // If for some reason the processed file is not in output folder, copy it there
      const processedFilePath = path.join(outputDir, processedFileName);
      try {
        if (!fs.existsSync(processedFilePath)) {
          // Copy the original file to output folder
          fs.copyFileSync(latestFile.path, processedFilePath);
        }
      } catch (copyOutputError) {
        console.warn(
          "Warning: Could not copy processed file to output:",
          copyOutputError.message
        );
        // Continue processing even if copy fails
      }

      // Step 4: Clean up the input folder - delete all files after successful processing
      try {
        const allInputFiles = fs.readdirSync(inputDir);
        allInputFiles.forEach((file) => {
          const filePath = path.join(inputDir, file);
          try {
            // Only delete files, not directories
            if (fs.statSync(filePath).isFile()) {
              fs.unlinkSync(filePath);
            }
          } catch (deleteInputError) {
            console.warn(
              `Warning: Could not delete input file ${file}:`,
              deleteInputError.message
            );
            // Continue processing even if file deletion fails
          }
        });
      } catch (readInputError) {
        console.warn(
          "Warning: Could not clean up input directory:",
          readInputError.message
        );
        // Continue processing even if cleanup fails
      }

      // Step 5: Convert CSV to JSON format and prepare data for MongoDB database
      const processedData = [];
      const dataToSave = [];

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        try {
          // Clean numeric fields before converting
          const cleanedQuantity = item["Quantity"]
            ? item["Quantity"].replace(/,/g, "")
            : "0";
          const cleanedNetValue = item["Net Value"]
            ? item["Net Value"].replace(/,/g, "")
            : "0";
          const cleanedAmountInLC = item["Amount in LC"]
            ? item["Amount in LC"].replace(/,/g, "")
            : "0";

          const mappedData = {
            companyCode: item["Company Code"] || "",
            vendorNumber: item["Vendor Number"] || "",
            vendorName: item["Vendor Name"] || "",
            purchaseOrderNumber: item["Purchare Order Number"] || "", // Note: typo in original CSV header
            poItemNumber: item["PO Item Number"] || "",
            documentType: item["Document Type"] || "",
            poLineDescription: item["PO Line Description"] || "",
            poDate: item["PO Date"] || "",
            plant: item["Plant"] || "",
            sesNumber: item["SES Number"] || "",
            sesItemNumber: item["SES Item Number"] || "",
            sesShortText: item["SES Short Text"] || "",
            quantity: cleanedQuantity,
            uom: item["UoM"] || "",
            netValue: cleanedNetValue,
            amountInLC: cleanedAmountInLC,
            taxCode: item["Tax Code"] || "",
            goodReceipt: item["Good Receipt"] || "",
            costCenter: item["Cost Center"] || "",
            profitCenter: item["Profit Center"] || "",
            createdBy: item["Created By"] || "",
            creationDate: item["Creation date"] || "",
            sourceFile: latestFile.name,
          };

          // Prepare data for database insertion
          const dbData = {
            ...mappedData,
            quantity: mongoose.Types.Decimal128.fromString(cleanedQuantity),
            netValue: mongoose.Types.Decimal128.fromString(cleanedNetValue),
            amountInLC: mongoose.Types.Decimal128.fromString(cleanedAmountInLC),
          };

          // Add to arrays (keeping numeric values as strings for JSON response)
          processedData.push(mappedData);
          dataToSave.push(dbData);
        } catch (e) {
          // console.log("Error preparing OpenGR record:", e.message);
        }
      }

      // Step 6: Only clear existing data and save if we have valid data to insert
      if (dataToSave.length > 0) {
        await OpenGR.deleteMany({});
        await OpenGR.insertMany(dataToSave);
      } else {
        // If no valid data was processed, don't clear the existing collection
        return res.status(400).json({
          message: "No valid data could be processed from the CSV file.",
        });
      }

      return res.status(200).json({
        message: "Data created successfully.",
        totalRecords: processedData.length,
        data: processedData,
      });
    } catch (err) {
      console.error("Error processing data:", err.message);
      return res.status(500).json({ message: err.message });
    }
  },
};

export default openGRController;
