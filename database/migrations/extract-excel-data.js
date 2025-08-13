#!/usr/bin/env node

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = '../sample data/psgc/updated/PSGC-2Q-2025-Publication-Datafile (1).xlsx';

function extractExcelData() {
  console.log('📊 EXTRACTING DATA FROM PSGC EXCEL FILE');
  console.log('========================================\n');
  
  try {
    const excelPath = path.join(__dirname, EXCEL_PATH);
    console.log(`📂 Reading: ${excelPath}`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(excelPath);
    
    console.log('📋 Available worksheets:', workbook.SheetNames);
    
    // Process each worksheet
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`\n📊 Processing Sheet ${index + 1}: "${sheetName}"`);
      console.log('-'.repeat(50));
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`Rows found: ${data.length}`);
      
      if (data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('Sample row:', data[0]);
        
        // Save each sheet as CSV
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const csvFileName = `${sheetName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
        const csvPath = path.join(__dirname, '../sample data/psgc/updated/', csvFileName);
        
        fs.writeFileSync(csvPath, csv);
        console.log(`✅ Saved as: ${csvFileName}`);
      }
    });
    
    console.log('\n🎉 Excel extraction completed!');
    console.log('Check the updated folder for extracted CSV files.');
    
  } catch (error) {
    console.error('❌ Error reading Excel file:', error.message);
  }
}

// Run the extraction
extractExcelData();