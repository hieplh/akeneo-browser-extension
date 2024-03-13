import * as fs from "fs";
import * as path from "path";
import packageJSON from "./package.json" assert {type: "json"};
import archiver from "archiver";

// Folder you want to check and create if it doesn't exist
const folderPath = path.resolve("release");

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
  console.log(`Folder created: ${folderPath}`);
} else {
  console.log(`Folder already exists: ${folderPath}`);
}

// Create a file to stream archive data to.
const output = fs.createWriteStream(
  `${folderPath}/AkEB-ver-${packageJSON.version}.zip`
);
const archive = archiver("zip", {
  zlib: { level: 9 }, // Sets the compression level.
});

// Listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on("close", function () {
  console.log(
    "Compression has been finalized. Total bytes: " + archive.pointer()
  );
});

// Good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on("warning", function (err) {
  if (err.code === "ENOENT") {
    // Log warning
    console.warn(err);
  } else {
    // Throw error
    throw err;
  }
});

// Good practice to catch this error explicitly
archive.on("error", function (err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Append files from the `dist` folder
// The `directory` method archives a directory and its contents
archive.directory("dist/", false);

// Finalize the archive (ie we are done appending files but streams have to finish yet)
// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
archive.finalize();
