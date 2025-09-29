import fs from "fs";
import path from "path";

// Copy the preprocessing function for testing
const preprocessCSVFile = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    return;
  }
  
  const headerLine = lines[0].trim();
  const expectedColumnCount = headerLine.split(',').length;
  
  const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const sesShortTextIndex = headers.findIndex(h => 
    h.toLowerCase() === 'ses short text' || h === 'SES Short Text'
  );
  
  if (sesShortTextIndex === -1) {
    console.log('SES Short Text column not found, available headers:', headers);
    return;
  }
  
  console.log(`Found SES Short Text at column index ${sesShortTextIndex}, expected ${expectedColumnCount} columns`);
  
  const processedLines = [headerLine];
  let processedCount = 0;
  let fixedCount = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = line.split(',');
    processedCount++;
    
    if (columns.length > expectedColumnCount) {
      fixedCount++;
      const extraColumns = columns.length - expectedColumnCount;
      
      const beforeSesText = columns.slice(0, sesShortTextIndex);
      const afterSesTextStartIndex = sesShortTextIndex + extraColumns + 1;
      const afterSesText = columns.slice(afterSesTextStartIndex);
      
      const sesTextParts = columns.slice(sesShortTextIndex, afterSesTextStartIndex);
      const cleanedSesText = sesTextParts.join(' ').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
      
      const reconstructedLine = [
        ...beforeSesText,
        `"${cleanedSesText}"`,
        ...afterSesText
      ].join(',');
      
      processedLines.push(reconstructedLine);
    } else {
      if (sesShortTextIndex < columns.length && columns[sesShortTextIndex]) {
        const originalText = columns[sesShortTextIndex].replace(/^"|"$/g, '');
        if (originalText.includes(',')) {
          const cleanedText = originalText.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
          columns[sesShortTextIndex] = `"${cleanedText}"`;
          fixedCount++;
        }
      }
      processedLines.push(columns.join(','));
    }
  }
  
  console.log(`Preprocessing stats: ${processedCount} lines processed, ${fixedCount} lines fixed`);
  
  fs.writeFileSync(filePath, processedLines.join('\n') + '\n', 'utf8');
};

// Create a test CSV file with comma issues
const testCSVContent = `Company Code,Vendor Number,Vendor Name,Purchare Order Number,PO Item Number,Document Type,PO Line Description,PO Date,Plant,SES Number,SES Item Number,SES Short Text,Quantity,UoM,Net Value,Amount in LC,Tax Code,Good Receipt,Cost Center,Profit Center,Created By,Creation date
1000,V001,Vendor A,PO001,10,DOC1,Description 1,20230101,P001,SES001,1,Normal text without comma,100,EA,1000.00,1000.00,T1,GR001,CC001,PC001,USER1,20230101
1000,V002,Vendor B,PO002,20,DOC2,Description 2,20230102,P002,SES002,2,Text with, comma in middle,200,EA,2000.00,2000.00,T2,GR002,CC002,PC002,USER2,20230102
1000,V003,Vendor C,PO003,30,DOC3,Description 3,20230103,P003,SES003,3,Multiple, commas, in text,300,EA,3000.00,3000.00,T3,GR003,CC003,PC003,USER3,20230103`;

// Write test file
const testFilePath = './test_csv.csv';
fs.writeFileSync(testFilePath, testCSVContent);

console.log('Original CSV content:');
console.log(testCSVContent);
console.log('\n=== Processing ===\n');

// Check original column counts
const originalLines = testCSVContent.split('\n');
console.log('Original column counts:');
originalLines.forEach((line, index) => {
  if (line.trim()) {
    console.log(`Line ${index}: ${line.split(',').length} columns`);
  }
});

// Process the test file
preprocessCSVFile(testFilePath);

// Read and display processed content
const processedContent = fs.readFileSync(testFilePath, 'utf8');
console.log('Processed CSV content:');
console.log(processedContent);

// Clean up
fs.unlinkSync(testFilePath);
