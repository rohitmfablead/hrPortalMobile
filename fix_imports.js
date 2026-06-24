const fs = require('fs');
const path = require('path');
const directoryPath = path.join(__dirname, 'src/components');

fs.readdirSync(directoryPath).forEach(file => {
  if (!file.endsWith('.tsx')) return;
  const filePath = path.join(directoryPath, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip TextInput from any import
  content = content.replace(/(import\s*{[^}]*)TextInput(,?)([^}]*}\s*from\s*['"]react-native['"])/g, (match, p1, p2, p3) => {
    let newImport = p1 + p3;
    newImport = newImport.replace(/,\s*,/g, ',');
    return newImport;
  });

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Fixed imports');
