import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import processAllCSVFiles from "../helpers/processCSVFiles.js";
import OpenGR from "../model/OpenGR/OpenGR.js";

/**
 * Preprocessing function to handle comma issues in SES Short Text field.
 * 
 * Problem: When the "SES Short Text" field contains commas, the CSV parser
 * treats them as column separators, causing the total column count to exceed
 * the expected number and resulting in parsing errors.
 * 
 * Solution: This function identifies lines with excessive columns, locates
 * the SES Short Text field, merges any comma-separated parts back together,
 * removes commas from the text, and wraps it in quotes for proper CSV formatting.
 * 
 * @param {string} filePath - Path to the CSV file to preprocess
 */
const preprocessCSVFile = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n').filter(line => line.trim()); // Remove empty lines
  
  if (lines.length < 2) {
    return; // Not enough lines to process
  }
  
  // Get the header line to determine expected column count
  const headerLine = lines[0].trim();
  const expectedColumnCount = headerLine.split(',').length;
  
  // Find the index of "SES Short Text" column in the header
  const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, '')); // Remove surrounding quotes
  const sesShortTextIndex = headers.findIndex(h => 
    h.toLowerCase() === 'ses short text' || h === 'SES Short Text'
  );
  
  if (sesShortTextIndex === -1) {
    console.log('SES Short Text column not found, available headers:', headers);
    return; // SES Short Text column not found, no preprocessing needed
  }
  
  console.log(`Found SES Short Text at column index ${sesShortTextIndex}, expected ${expectedColumnCount} columns`);
  
  const processedLines = [headerLine]; // Keep header as is
  let processedCount = 0;
  let fixedCount = 0;
  
  // Process each data line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const columns = line.split(',');
    processedCount++;
    
    // Check if column count exceeds expected count
    if (columns.length > expectedColumnCount) {
      fixedCount++;
      // The issue is likely in SES Short Text field containing commas
      // Calculate how many extra columns we have
      const extraColumns = columns.length - expectedColumnCount;
      
      const beforeSesText = columns.slice(0, sesShortTextIndex);
      const afterSesTextStartIndex = sesShortTextIndex + extraColumns + 1;
      const afterSesText = columns.slice(afterSesTextStartIndex);
      
      // Merge the SES Short Text parts and remove commas
      const sesTextParts = columns.slice(sesShortTextIndex, afterSesTextStartIndex);
      const cleanedSesText = sesTextParts.join(' ').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Reconstruct the line with cleaned SES Short Text
      const reconstructedLine = [
        ...beforeSesText,
        `"${cleanedSesText}"`, // Wrap in quotes to handle any remaining special characters
        ...afterSesText
      ].join(',');
      
      processedLines.push(reconstructedLine);
    } else {
      // Line has correct column count, but still clean SES Short Text if it contains commas
      if (sesShortTextIndex < columns.length && columns[sesShortTextIndex]) {
        const originalText = columns[sesShortTextIndex].replace(/^"|"$/g, ''); // Remove quotes
        if (originalText.includes(',')) {
          const cleanedText = originalText.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
          columns[sesShortTextIndex] = `"${cleanedText}"`; // Wrap in quotes
          fixedCount++;
        }
      }
      processedLines.push(columns.join(','));
    }
  }
  
  console.log(`Preprocessing stats: ${processedCount} lines processed, ${fixedCount} lines fixed`);
  
  // Write the processed content back to the file
  fs.writeFileSync(filePath, processedLines.join('\n') + '\n', 'utf8');
};

const openGRController = {
  // POST method - Process CSV/text files and save to database
  processOpenGR: async (req, res) => {
    const inputDir = "./fileUploads/SAP/PRD_GRIR/DOWNLOAD/IN"; // "in" folder for CSV/text files to be processed
    const outputDir = "./fileUploads/SAP/PRD_GRIR/DOWNLOAD/OUT"; // "out" folder for processed files

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

        // Immediate check after assignment
        if (!latestFile) {
          return res
            .status(400)
            .json({ message: "No valid files could be processed." });
        }
      } catch (statError) {
        return res.status(500).json({
          message: "Error accessing file information: " + statError.message,
        });
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
        
        // Step 2a: Preprocess the CSV file to handle comma issues in SES Short Text
        console.log(`Starting preprocessing for: ${fileName}`);
        try {
          preprocessCSVFile(tempFilePath);
          console.log(`Preprocessing completed successfully for: ${fileName}`);
        } catch (preprocessError) {
          console.warn(`Warning: Preprocessing failed for ${fileName}:`, preprocessError.message);
          console.warn('Continuing with original file - may cause parsing issues if SES Short Text contains commas');
          // Continue processing even if preprocessing fails
        }
        
      } catch (copyError) {
        // Clean up temp directory before returning error
        try {
          fs.rmSync(tempInputDir, { recursive: true, force: true });
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        return res.status(500).json({
          message:
            "Error copying or preprocessing file: " + copyError.message,
        });
      }

      // Step 2b: Process the latest file using the existing helper
      let data;
      const tempOutputDir = path.join(outputDir, "../temp_output");
      try {
        // Create temp output directory for processing
        if (!fs.existsSync(tempOutputDir)) {
          fs.mkdirSync(tempOutputDir, { recursive: true });
        }

        data = await processAllCSVFiles(
          tempInputDir,
          tempOutputDir,
          0,
          0,
          true
        );
      } catch (processError) {
        // Clean up temp directories before returning error
        try {
          fs.rmSync(tempInputDir, { recursive: true, force: true });
          fs.rmSync(tempOutputDir, { recursive: true, force: true });
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        return res.status(400).json({
          message: "Error processing CSV file: " + processError.message,
        });
      }

      if (!data || data.length === 0) {
        // Clean up temp directories
        try {
          fs.rmSync(tempInputDir, { recursive: true, force: true });
          fs.rmSync(tempOutputDir, { recursive: true, force: true });
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        return res
          .status(400)
          .json({ message: "No data found in the CSV folder." });
      }

      // Step 3: Convert CSV to JSON format and prepare data for MongoDB database
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

      // Step 4: Only proceed with file transfer and database operations if we have valid data
      if (dataToSave.length === 0) {
        // Clean up temp directories
        try {
          fs.rmSync(tempInputDir, { recursive: true, force: true });
          fs.rmSync(tempOutputDir, { recursive: true, force: true });
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        return res.status(400).json({
          message: "No valid data could be processed from the CSV file.",
        });
      }

      // Step 5: Clear existing data and save new data to MongoDB
      await OpenGR.deleteMany({});
      await OpenGR.insertMany(dataToSave);

      // Step 6: Transfer processed file to output folder (overwrite if exists)
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

      // Move processed file from temp output to actual output folder
      const processedFileName =
        fileExt === ".txt"
          ? latestFile.name.replace(/\.txt$/i, ".csv")
          : latestFile.name;

      const processedFilePath = path.join(outputDir, processedFileName);
      const tempProcessedFilePath = path.join(tempOutputDir, processedFileName);

      try {
        // Copy processed file to output directory (will overwrite if exists)
        fs.copyFileSync(tempProcessedFilePath, processedFilePath);
      } catch (copyOutputError) {
        console.warn(
          "Warning: Could not copy processed file to output:",
          copyOutputError.message
        );
      }

      // Step 7: Clean up the input folder - delete the consumed file only after successful processing
      try {
        fs.unlinkSync(latestFile.path);
      } catch (deleteInputError) {
        console.warn(
          `Warning: Could not delete input file ${latestFile.name}:`,
          deleteInputError.message
        );
      }

      // Clean up temp directories
      try {
        fs.rmSync(tempInputDir, { recursive: true, force: true });
        fs.rmSync(tempOutputDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn(
          "Warning: Could not clean up temp directories:",
          cleanupError.message
        );
      }

      return res.status(200).json({
        message: "Data processed and saved successfully.",
        totalRecords: processedData.length,
        processedFile: latestFile.name,
      });
    } catch (err) {
      console.error("Error processing data:", err.message);
      return res.status(500).json({ message: err.message });
    }
  },

  // GET method - Retrieve OpenGR data with optional filters
  getOpenGR: async (req, res) => {
    try {
      const { poDate, costCenter, page = 1, limit = 100 } = req.query;

      // Build filter object
      const filter = {};

      // Handle poDate parameter - convert yyyy-MM-dd to yyyyMMdd format
      if (poDate) {
        // Validate date format yyyy-MM-dd
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(poDate)) {
          return res.status(400).json({
            message: "Invalid poDate format. Please use yyyy-MM-dd format.",
          });
        }

        // Convert yyyy-MM-dd to yyyyMMdd
        const formattedDate = poDate.replace(/-/g, "");
        filter.poDate = formattedDate;
      }

      // Handle costCenter parameter
      if (costCenter) {
        filter.costCenter = costCenter;
      }

      // Calculate pagination
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Get total count for pagination info
      const totalRecords = await OpenGR.countDocuments(filter);

      // Get filtered data with pagination
      const data = await OpenGR.find(filter)
        .skip(skip)
        .limit(limitNum)
        .sort({ processedDate: -1 }) // Sort by most recent processed date
        .lean();

      // Convert Decimal128 values to strings for JSON response
      const processedData = data.map((item) => ({
        ...item,
        quantity: item.quantity ? item.quantity.toString() : "0",
        netValue: item.netValue ? item.netValue.toString() : "0",
        amountInLC: item.amountInLC ? item.amountInLC.toString() : "0",
      }));

      return res.status(200).json({
        message: "Data retrieved successfully.",
        totalRecords,
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum),
        recordsPerPage: limitNum,
        filters: {
          poDate: poDate || null,
          costCenter: costCenter || null,
        },
        data: processedData,
      });
    } catch (err) {
      console.error("Error retrieving data:", err.message);
      return res.status(500).json({ message: err.message });
    }
  },
};

export default openGRController;
