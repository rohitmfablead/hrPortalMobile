const fs = require('fs');
const file = 'src/components/AddLeaveModal.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\]\} \s*value=/g, ' value=');
content = content.replace(/\]\}\s*onChangeText/g, ' onChangeText');
content = content.replace(/\n\s*\]\} \n/g, '\n');
fs.writeFileSync(file, content, 'utf8');
