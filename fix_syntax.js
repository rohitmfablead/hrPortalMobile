const fs = require('fs');
const files = [
    'src/components/AddAnnouncementModal.tsx',
    'src/components/AddFeedbackModal.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\]\} value=/g, ' value=');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
});
