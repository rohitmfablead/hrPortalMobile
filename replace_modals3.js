const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src/components');

fs.readdirSync(directoryPath).forEach(file => {
  if (!file.endsWith('Modal.tsx')) return;
  const filePath = path.join(directoryPath, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix imports if necessary
  if (!content.includes("import CustomTextInput")) {
      content = content.replace(/(import\s*{[^}]*)TextInput(,?)([^}]*}\s*from\s*['"]react-native['"])/, (match, p1, p2, p3) => {
        let newImport = p1 + p3;
        newImport = newImport.replace(/,\s*,/g, ',');
        return newImport;
      });
      content = content.replace(/import\s*{[^}]*}\s*from\s*['"]react-native['"];/, match => `${match}\nimport CustomTextInput from './CustomTextInput';`);
  } else {
      // Remove TextInput from react-native just in case
      content = content.replace(/(import\s*{[^}]*)TextInput(,?)([^}]*}\s*from\s*['"]react-native['"])/, (match, p1, p2, p3) => {
        let newImport = p1 + p3;
        newImport = newImport.replace(/,\s*,/g, ',');
        return newImport;
      });
  }

  // 1. Replace formRow elements (with flex)
  const regex = /<View style={\[?styles\.formGroup[^>]*>[\s\S]*?<Text style={styles\.label}>(.*?)<\/Text>[\s\S]*?<View style={[^>]*inputContainer[^>]*}>[\s\S]*?<([A-Z][A-Za-z0-9]*) color="#F97316" size={20} style={styles\.inputIcon} \/>[\s\S]*?<TextInput([\s\S]*?)\/>[\s\S]*?<\/View>[\s\S]*?<\/View>/g;
  
  content = content.replace(regex, (match, label, IconName, textInputProps) => {
      let isFlex = match.includes('flex: 1');
      let marginStyle = match.match(/marginRight:\s*\d+/);
      marginStyle = marginStyle ? marginStyle[0] : null;
      let marginLeftStyle = match.match(/marginLeft:\s*\d+/);
      marginLeftStyle = marginLeftStyle ? marginLeftStyle[0] : null;
      
      let flexProps = '';
      if (isFlex) {
          flexProps = ` style={{ flex: 1${marginStyle ? ', ' + marginStyle : ''}${marginLeftStyle ? ', ' + marginLeftStyle : ''} }}`;
      }
      
      let newProps = textInputProps.replace(/style={[^}]+}\s*/g, '');
      newProps = newProps.replace(/placeholderTextColor="[^"]+"\s*/g, '');
      
      return `<CustomTextInput
              label="${label}"
              ${newProps.trim()}
              left={<CustomTextInput.Icon icon={() => <${IconName} color="#F97316" size={20} />} />}
              ${flexProps}
            />`;
  });

  // Multiline inputs (usually have an array for inputContainer style)
  const regexMulti = /<View style={\[?styles\.formGroup[^>]*>[\s\S]*?<Text style={styles\.label}>(.*?)<\/Text>[\s\S]*?<View style={\[styles\.inputContainer[^>]*}>[\s\S]*?<([A-Z][A-Za-z0-9]*) color="#F97316" size={20} style={styles\.inputIcon} \/>[\s\S]*?<TextInput([\s\S]*?)\/>[\s\S]*?<\/View>[\s\S]*?<\/View>/g;
  content = content.replace(regexMulti, (match, label, IconName, textInputProps) => {
      let newProps = textInputProps.replace(/style={[^}]+}\s*/g, '');
      newProps = newProps.replace(/placeholderTextColor="[^"]+"\s*/g, '');
      return `<CustomTextInput
              label="${label}"
              ${newProps.trim()}
              left={<CustomTextInput.Icon icon={() => <${IconName} color="#F97316" size={20} />} />}
            />`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed:', file);
});
console.log('Done');
