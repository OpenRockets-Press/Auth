const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

const baseDir = 'c:/Users/HP/Documents/trash/DataHub-UI-Sandbox/src';

// 1. index.css
replaceInFile(path.join(baseDir, 'index.css'), [
  ['#202124', '#000000'],
  ['#e8eaed', '#ffffff'],
  ['#9aa0a6', '#ffffff'],
  ['#5f6368', '#ffffff'],
  ['#8ab4f8', '#ffffff'],
  ['#d93025', '#ffffff'],
  ['background-color: #303134', 'background-color: #ffffff'],
  ['color: #e8eaed', 'color: #000000']
]);

// 2. AppLayout.tsx
replaceInFile(path.join(baseDir, 'components', 'AppLayout.tsx'), [
  ['#202124', '#000000'],
  ['#e8eaed', '#ffffff'],
  ['#9aa0a6', '#ffffff'],
  ['#5f6368', '#ffffff'],
  ['<img src={logoPath}', '<img src={logoPath} style={{ filter: "invert(1)" }} '],
  ["backgroundColor: '#e8eaed'", "backgroundColor: '#ffffff', color: '#000000'"],
  ["color: '#e8eaed'", "color: '#ffffff'"],
  ["color: '#9aa0a6'", "color: '#ffffff'"]
]);

// 3. HomeDashboard.tsx
replaceInFile(path.join(baseDir, 'components', 'HomeDashboard.tsx'), [
  ['#202124', '#000000'],
  ['#e8eaed', '#ffffff'],
  ['#9aa0a6', '#ffffff'],
  ['#5f6368', '#ffffff'],
  ['#303134', '#ffffff'], // search bar bg
  ["color: '#ffffff'", "color: '#000000'"] // search text in white bg
]);

// 4. ConnectedAppsScreen.tsx
replaceInFile(path.join(baseDir, 'components', 'ConnectedAppsScreen.tsx'), [
  ['#202124', '#000000'],
  ['#e8eaed', '#ffffff'],
  ['#9aa0a6', '#ffffff'],
  ['#5f6368', '#ffffff'],
  ['rgba(32,33,36,0.8)', '#000000'],
  ['#1a73e8', '#ffffff'],
  ['#d93025', '#ffffff'],
  ['#303134', '#ffffff'], // icon bg
  ["color: '#ffffff'", "color: '#000000'"], // icons in white bg
  ["backgroundColor = '#303134'", "backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'"],
  ["backgroundColor = '#000000'", "backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'"],
  ["color: deletingKey === data.key ? '#a19f9d' : '#ffffff'", "color: '#ffffff'"],
  ["color: '#a19f9d'", "color: '#ffffff'"]
]);

// 5. DataAgreementsScreen.tsx
replaceInFile(path.join(baseDir, 'components', 'DataAgreementsScreen.tsx'), [
  ['#202124', '#000000'],
  ['#e8eaed', '#ffffff'],
  ['#9aa0a6', '#ffffff'],
  ['#5f6368', '#ffffff'],
  ['rgba(32,33,36,0.8)', '#000000'],
  ['#1a73e8', '#ffffff'],
  ['#303134', '#ffffff'], // icon bg
  ["color: '#ffffff'", "color: '#000000'"],
  ["backgroundColor = '#303134'", "backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'"],
  ["backgroundColor = 'transparent'", "backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'"],
  ["backgroundColor = '#000000'", "backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'"]
]);

// 6. SettingsScreen.tsx
replaceInFile(path.join(baseDir, 'components', 'SettingsScreen.tsx'), [
  ['#202124', '#000000'],
  ['#e8eaed', '#ffffff'],
  ['#9aa0a6', '#ffffff'],
  ['#5f6368', '#ffffff'],
  ['rgba(32,33,36,0.8)', '#000000'],
  ['#1a73e8', '#ffffff'],
  ['#303134', '#ffffff'], // icon bg
  ['#3c4043', '#ffffff'], // badge bg
  ['#8ab4f8', '#000000'], // badge text
  ["color: '#ffffff'", "color: '#000000'"],
  ["backgroundColor = '#303134'", "backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'"],
  ["backgroundColor = 'transparent'", "backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'"],
  ["backgroundColor = '#000000'", "backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'"]
]);

console.log('Strict B/W mode applied.');
