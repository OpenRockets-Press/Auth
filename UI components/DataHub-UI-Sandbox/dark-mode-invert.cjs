const fs = require('fs');
const path = require('path');

const map = {
    '#ffffff': '#202124',
    '#fff': '#202124',
    '#202124': '#e8eaed',
    '#f1f3f4': '#303134',
    '#f3f2f1': '#303134',
    '#dadce0': '#5f6368',
    '#5f6368': '#9aa0a6',
    '#1a73e8': '#8ab4f8',
    '#e8f0fe': '#3c4043',
    'rgba(255,255,255,0.8)': 'rgba(32,33,36,0.8)',
    '#000000': '#ffffff',
    '#000': '#ffffff',
    'white': '#202124',
    'black': '#ffffff'
};

const regex = new RegExp(Object.keys(map).map(k => k.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')).join('|'), 'gi');

function processFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, (match) => {
        return map[match.toLowerCase()] || map[match];
    });
    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed:', file);
}

const dir = 'c:/Users/HP/Documents/trash/DataHub-UI-Sandbox/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(f => processFile(path.join(dir, f)));

processFile('c:/Users/HP/Documents/trash/DataHub-UI-Sandbox/src/App.tsx');
processFile('c:/Users/HP/Documents/trash/DataHub-UI-Sandbox/src/index.css');
