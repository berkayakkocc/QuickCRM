const fs = require('fs');
const path = require('path');

function findFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

function stripBOM(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file starts with BOM (UTF-8 BOM is 0xFEFF)
    if (content.charCodeAt(0) === 0xFEFF) {
      const cleanContent = content.slice(1);
      fs.writeFileSync(filePath, cleanContent, 'utf8');
      console.log('✅ BOM removed:', filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error processing file:', filePath, error.message);
    return false;
  }
}

// Main execution
console.log('🔍 Scanning for files with BOM...\n');

const extensions = ['.ts', '.tsx', '.js', '.jsx'];
const files = findFiles('./src', extensions);

let processedCount = 0;
let bomRemovedCount = 0;

files.forEach(file => {
  processedCount++;
  if (stripBOM(file)) {
    bomRemovedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Files processed: ${processedCount}`);
console.log(`   BOM removed: ${bomRemovedCount}`);
console.log(`   Clean files: ${processedCount - bomRemovedCount}`);

if (bomRemovedCount > 0) {
  console.log('\n🎉 BOM cleanup completed successfully!');
} else {
  console.log('\n✨ All files are already clean!');
}
