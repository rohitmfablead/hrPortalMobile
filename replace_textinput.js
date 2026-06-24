const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.tsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(directoryPath);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Check if react-native-paper's TextInput is imported
  if (!content.includes("import") || !content.includes("react-native-paper")) return;
  if (!content.match(/import\s+{[^}]*TextInput[^}]*}\s+from\s+['"]react-native-paper['"]/)) {
      if (!content.includes("<TextInput")) return; // Might be imported differently, but if no <TextInput, skip.
  }

  // 1. Remove TextInput from react-native-paper import
  content = content.replace(/(import\s+{[^}]*)(TextInput\s*,?\s*)([^}]*}\s+from\s+['"]react-native-paper['"])/, (match, p1, p2, p3) => {
    let newImport = p1 + p3;
    // Clean up empty commas
    newImport = newImport.replace(/,\s*,/g, ',');
    newImport = newImport.replace(/{\s*,/g, '{');
    newImport = newImport.replace(/,\s*}/g, '}');
    if (newImport.match(/{\s*}/)) {
      return ''; // Empty import
    }
    return newImport;
  });

  // 2. Add CustomTextInput import
  // Determine relative path depth
  const relativePath = path.relative(path.dirname(file), path.join(__dirname, 'src/components/CustomTextInput'));
  let importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
  importPath = importPath.replace(/\\/g, '/'); // For windows just in case

  if (content.includes("<TextInput")) {
      content = `import CustomTextInput from '${importPath}';\n` + content;
  }

  // 3. Replace <TextInput with <CustomTextInput
  content = content.replace(/<TextInput/g, '<CustomTextInput');
  content = content.replace(/<\/TextInput>/g, '</CustomTextInput>');

  // 4. Remove redundant mode="outlined", textColor, and theme from CustomTextInput usages
  // Since we are doing this globally and CustomTextInput provides these by default.
  // We'll use a regex to match the CustomTextInput tag and remove these props.
  content = content.replace(/<CustomTextInput([^>]+)>/g, (match, propsStr) => {
      let newProps = propsStr;
      newProps = newProps.replace(/\s+mode=["']outlined["']/g, '');
      newProps = newProps.replace(/\s+textColor=["']#0F172A["']/g, '');
      newProps = newProps.replace(/\s+theme={{ colors: { background: ['"]#FFFFFF["'], onSurfaceVariant: ['"]#475569["'] } }}/g, '');
      // Some formatting might have newlines, so we're just matching basic single line stuff or we'll let it be.
      return `<CustomTextInput${newProps}>`;
  });

  // Remove `style={styles.input}` if it is exactly that, since CustomTextInput has it by default
  // Wait, different files might have different `styles.input` margins. Let's keep `style={styles.input}` and not remove it, just in case.

  fs.writeFileSync(file, content, 'utf8');
  console.log('Processed:', file);
});
console.log('Done!');
