import { fileURLToPath } from 'url';
import path from 'path';
import csvtojson from 'csvtojson';
import fs from 'fs';

//directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to remove lines from the beginning and end of a CSV file
const removeLinesFromCSV = (data, startLines, endLines) => {
    const lines = data.split('\n');
    return lines.slice(startLines, lines.length - endLines).join('\n');
};

// Function to process all CSV files in the input directory
const processCSVFiles = async (inputDir, outputDir, startLines, endLines) => {
    const dataToSave = [];
    try {
        const files = fs.readdirSync(inputDir);
        if (files.length === 0) {
            throw new Error('Empty directory.')
        }
        for (const file of files) {
            // Check if the file has a .csv extension
            if (path.extname(file).toLowerCase() === '.csv') {
                const filePath = path.join(inputDir, file);

                // Read and process the file
                const fileData = fs.readFileSync(filePath, 'utf8');
                const trimmedData = removeLinesFromCSV(fileData, startLines, endLines);

                // Convert trimmed CSV data to JSON
                const tempFilePath = path.join(outputDir, 'temp.csv');
                fs.writeFileSync(tempFilePath, trimmedData);
                const jsonArray = await csvtojson({
                    noheader: false,
                    trim: true,
                    delimiter: "\t"
                }).fromFile(tempFilePath);
                dataToSave.push(...jsonArray);

                // Remove the temporary file
                fs.unlinkSync(tempFilePath);

                // Move processed file to the output directory with the same name
                const outputFilePath = path.join(outputDir, file);
                fs.renameSync(filePath, outputFilePath);
            } else {
                console.log(`Ignoring non-CSV file: ${file}`);
            }
        }
        console.log('All CSV files processed successfully.');
    } catch (error) {
        throw error
    }
    return dataToSave;
};

export default processCSVFiles;