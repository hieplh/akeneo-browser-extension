import * as fs from 'fs';
import * as path from 'path';

// Folder you want to check and create if it doesn't exist
const folderPath = path.resolve('release');

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
  console.log(`Folder created: ${folderPath}`);
} else {
  console.log(`Folder already exists: ${folderPath}`);
}
