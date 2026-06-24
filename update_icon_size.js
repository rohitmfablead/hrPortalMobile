const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/components');
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    // We only want to replace size={20} inside the icon={() => <IconName ... />}
    // But honestly, we can just replace size={20} to size={18} across these modal files since they are mostly just form inputs.
    content = content.replace(/size=\{20\}/g, 'size={18}');
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Icon sizes updated');
