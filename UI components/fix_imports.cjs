const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        if (!file.endsWith('types.ts')) {
          results.push(file);
        }
      }
    }
  });
  return results;
}

const files = walk('c:/Users/HP/Documents/trash/Auth/UI components');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]*models\/types)['"]/g, "import type { $1 } from '$2'");
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed', file);
  }
});
