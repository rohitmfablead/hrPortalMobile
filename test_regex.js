const fs = require('fs');
const content = fs.readFileSync('src/components/AddEmployeeModal.tsx', 'utf8');
const regex = /<View style={\[?styles\.formGroup[^>]*>[\s\S]*?<Text style={styles\.label}>(.*?)<\/Text>[\s\S]*?<View style={[^>]*inputContainer[^>]*}>[\s\S]*?<([A-Z][A-Za-z0-9]*) color="#F97316" size={20} style={styles\.inputIcon} \/>[\s\S]*?<TextInput([\s\S]*?)\/>[\s\S]*?<\/View>[\s\S]*?<\/View>/g;

let matches = [...content.matchAll(regex)];
console.log("Matches found:", matches.length);
if (matches.length > 0) {
    console.log("First match:", matches[0][0]);
} else {
    // try to find where it fails
    const partial1 = /<View style={\[?styles\.formGroup[^>]*>[\s\S]*?<Text style={styles\.label}>(.*?)<\/Text>/g;
    console.log("Partial 1 matches:", [...content.matchAll(partial1)].length);
    
    const partial2 = /<View style={\[?styles\.formGroup[^>]*>[\s\S]*?<Text style={styles\.label}>(.*?)<\/Text>[\s\S]*?<View style={[^>]*inputContainer[^>]*}>/g;
    console.log("Partial 2 matches:", [...content.matchAll(partial2)].length);
    
    const partial3 = /<View style={\[?styles\.formGroup[^>]*>[\s\S]*?<Text style={styles\.label}>(.*?)<\/Text>[\s\S]*?<View style={[^>]*inputContainer[^>]*}>[\s\S]*?<([A-Z][A-Za-z0-9]*) color="#F97316" size={20} style={styles\.inputIcon} \/>/g;
    console.log("Partial 3 matches:", [...content.matchAll(partial3)].length);
}
