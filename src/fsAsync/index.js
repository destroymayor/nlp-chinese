import fs from "fs";

import {
  promisify
} from "util";

const fs_readFileSync = promisify(fs.readFile);
const fs_writeFileSync = promisify(fs.writeFileSync);
const fs_appendFileSync = promisify(fs.appendFileSync);

// read file async
const readFileAsync = path => {
  return new Promise((resolve, reject) => {
    fs_readFileSync(path, "utf-8", (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const exportResult = async (parsedResult, coverFile) => {
  const coverData = await readFileAsync(coverFile);
  const jsonData = JSON.parse(coverData);
  parsedResult.map(item => {
    jsonData.push(item);
  });

  fs_writeFileSync(coverFile, JSON.stringify(jsonData), err => {
    if (err) console.log("write", err);
  });
};

export {
  readFileAsync,
  fs_writeFileSync,
  fs_appendFileSync,
  exportResult
};
