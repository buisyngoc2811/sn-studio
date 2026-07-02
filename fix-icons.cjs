const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let changedFiles = [];

files.forEach(file => {
  if (file.endsWith('Icons.tsx')) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Find imports from Icons
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"](?:\.\/|\.\.\/|\.\.\/\.\.\/)?(?:components\/)?Icons['"]/g;
  let match;
  let hasChanges = false;
  
  // Collect replacements
  let newContent = content;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importBlock = match[1];
    const iconNames = importBlock.split(',').map(s => s.trim()).filter(Boolean);
    
    const newImports = [];
    iconNames.forEach(icon => {
      const lucideName = icon.replace(/Icon$/, '');
      newImports.push(lucideName);
      
      // Replace usages in file
      const regex = new RegExp(icon + '(?![a-zA-Z])', 'g');
      newContent = newContent.replace(regex, lucideName);
    });
    
    // Replace the import statement
    const newImportStmt = 'import { ' + newImports.join(', ') + ' } from "lucide-react"';
    newContent = newContent.replace(match[0], newImportStmt);
    hasChanges = true;
  }
  
  if (hasChanges) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles.push(file);
  }
});

console.log('Changed files:', changedFiles);
