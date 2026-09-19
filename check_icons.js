const fs = require('fs');
const code = fs.readFileSync('c:/Users/zaida/OneDrive/Desktop/rifah/rifah-frontend/modules/admin/components/operations-center/operations-center.jsx', 'utf8');

// Get imported lucide icons
const importMatch = code.match(/import\s+{([^}]+)}\s+from\s+["']lucide-react["']/);
if (!importMatch) {
  console.log("No lucide-react import found");
  process.exit(1);
}

const importedIcons = importMatch[1]
  .split(',')
  .map(i => i.trim())
  .filter(Boolean);

// Find all capitalized components used as tags
const tagRegex = /<([A-Z][A-Za-z0-9]+)/g;
const usedComponents = new Set();
let match;
while ((match = tagRegex.exec(code)) !== null) {
  usedComponents.add(match[1]);
}

// Ignore known local components or standard html-like (which are lowercase, but just in case)
const ignoreList = new Set([
  'Button', 'Input', 'Label', 'Textarea', 'Select', 'SelectContent', 'SelectItem', 'SelectTrigger', 'SelectValue',
  'Dialog', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogFooter', 'DialogDescription',
  'DynamicQrCode', 'StatCard', 'Pill', 'Link'
]);

const missingIcons = [];
for (const comp of usedComponents) {
  if (!ignoreList.has(comp) && !importedIcons.includes(comp)) {
    // Check if it looks like an icon (most are, if not in ignore list)
    missingIcons.push(comp);
  }
}

console.log("Missing imports that might be icons:", missingIcons);
