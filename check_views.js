const fs = require('fs');
const files = fs.readdirSync('src/components').filter(f => f.endsWith('Modal.tsx'));

files.forEach(f => {
    const c = fs.readFileSync('src/components/' + f, 'utf8');
    const openTags = (c.match(/<View/g) || []).length;
    const closeTags = (c.match(/<\/View>/g) || []).length;
    if (openTags !== closeTags) {
        console.log(f, 'Mismatched! Open:', openTags, 'Close:', closeTags);
    }
});
console.log('Check complete.');
