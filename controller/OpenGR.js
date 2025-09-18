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
      // Step 1: Find the latest CSV or text file in the input directory
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
      const latestFile = validFiles
        .map((file) => ({
          name: file,
          path: path.join(inputDir, file),
          mtime: fs.statSync(path.join(inputDir, file)).mtime,
        }))
        .sort((a, b) => b.mtime - a.mtime)[0];

      console.log(`Processing latest file: ${latestFile.name}`);

      // Create a temporary directory with only the latest file to use with existing helper
      const tempInputDir = path.join(inputDir, "../temp_input");
      if (!fs.existsSync(tempInputDir)) {
        fs.mkdirSync(tempInputDir, { recursive: true });
      }

      // Copy the latest file to temp directory
      // If it's a .txt file, rename it to .csv so the helper can process it
      const fileExt = path.extname(latestFile.name).toLowerCase();
      const fileName =
        fileExt === ".txt"
          ? latestFile.name.replace(/\.txt$/i, ".csv")
          : latestFile.name;

      const tempFilePath = path.join(tempInputDir, fileName);
      fs.copyFileSync(latestFile.path, tempFilePath);

      // Step 2: Process the latest file using the existing helper
      const data = await processAllCSVFiles(
        tempInputDir,
        outputDir,
        0,
        0,
        true
      );

      // Clean up temp directory
      fs.rmSync(tempInputDir, { recursive: true, force: true });

      if (!data || data.length === 0) {
        return res
          .status(400)
          .json({ message: "No data found in the CSV folder." });
      }

      // Step 3: Clean up output folder to keep only the latest processed file
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Get all files currently in output folder
      const outputFiles = fs.readdirSync(outputDir);

      // Find the processed file that was just moved by the helper (should match the original filename)
      const processedFileName =
        fileExt === ".txt"
          ? latestFile.name.replace(/\.txt$/i, ".csv")
          : latestFile.name;

      // Remove all files except the one we just processed
      outputFiles.forEach((file) => {
        if (file !== processedFileName) {
          const filePath = path.join(outputDir, file);
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          }
        }
      });

      // If for some reason the processed file is not in output folder, copy it there
      const processedFilePath = path.join(outputDir, processedFileName);
      if (!fs.existsSync(processedFilePath)) {
        // Copy the original file to output folder
        fs.copyFileSync(latestFile.path, processedFilePath);
      }

      // Step 4: Clean up the input folder - delete all files after successful processing
      const allInputFiles = fs.readdirSync(inputDir);
      allInputFiles.forEach((file) => {
        const filePath = path.join(inputDir, file);
        // Only delete files, not directories
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });

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
