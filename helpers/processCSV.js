import { fileURLToPath } from 'url';
import path from 'path';
import csvtojson from 'csvtojson';
import fs from 'fs';
// This file is for processing AP Files.


//directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//directories for input and output CSV files
const inputDir = path.join(__dirname, '../fileUploads/In/ap');
const outputDir = path.join(__dirname, '../fileUploads/Out/ap');

// Function to remove lines from the beginning and end of a CSV file
const removeLinesFromCSV = async (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8').split('\n');
        const trimmedData = data.slice(4, data.length - 5).join('\n');
        return trimmedData;

    } catch (error) {
        console.error('Error trimming CSV:', error);
        throw error;
    }
};

// Function to process a single CSV file
const processCSVFile = async (filePath) => {
    const dataToSave = [];
    try {
        // Remove lines from CSV before converting to JSON
        const trimmedData = await removeLinesFromCSV(filePath);

        // Write trimmed data to a temporary file
        const tempFilePath = path.join(outputDir, 'temp.csv');
        fs.writeFileSync(tempFilePath, trimmedData);

        // Convert CSV to JSON array using csvtojson with specified options
        const jsonArray = await csvtojson({
            noheader: false,
            trim: true,
            delimiter: "\t"
        }).fromFile(tempFilePath);

        dataToSave.push(...jsonArray);

        // Remove the temporary file
        fs.unlinkSync(tempFilePath);

        return dataToSave;
    } catch (error) {
        console.error('Error processing CSV:', error);
        throw error;
    }
};

// Function to process all CSV files in the input directory
const processAllCSVFiles = async () => {
    const dataToSave = [];
    try {
        const files = fs.readdirSync(inputDir);
        if (files.length === 0) {
            console.log('No CSV files found in the input directory.');
            return;
        }
        for (const file of files) {
            // Check if the file has a .csv extension
            if (path.extname(file).toLowerCase() === '.csv') {
                const filePath = path.join(inputDir, file);
                const fileData = await processCSVFile(filePath);
                dataToSave.push(...fileData);

                // Move processed file to the output directory with the same name
                const outputFilePath = path.join(outputDir, file);
                fs.renameSync(filePath, outputFilePath);
            } else {
                console.log(`Ignoring non-CSV file: ${file}`);
            }
        }

        console.log('All CSV files processed successfully.');
    } catch (error) {
        console.error('Error processing all CSV files:', error);
    }
    return dataToSave;
};

export default processAllCSVFiles;