import { fileURLToPath } from 'url';
import path from 'path';
import csvtojson from 'csvtojson';
import fs from 'fs';
// This file is for processing AP Files.

//directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//directories for input and output CSV files
const inputDir = path.join(__dirname, '../fileUploads/In/ar');
const outputDir = path.join(__dirname, '../fileUploads/Out/ar');