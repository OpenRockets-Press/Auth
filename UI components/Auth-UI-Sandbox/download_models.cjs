const fs = require('fs');
const https = require('https');
const path = require('path');

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const modelsDir = path.join(__dirname, 'public', 'models');

const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'age_gender_model-weights_manifest.json',
  'age_gender_model-shard1'
];

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

async function main() {
  for (const file of files) {
    console.log(`Downloading ${file}...`);
    await download(`${baseUrl}${file}`, path.join(modelsDir, file));
    console.log(`Finished ${file}`);
  }
}

main().catch(console.error);
