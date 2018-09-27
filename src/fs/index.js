import fs from "fs";

import util from "util";

const fs_writeFileSync = util.promisify(fs.writeFileSync);
const fs_appendFileSync = util.promisify(fs.appendFileSync);

// read file async
const readFileAsync = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const exportResult = (parsedResult, coverFile) => {
  readFileAsync(coverFile)
    .then(data => {
      const jsonData = JSON.parse(data);

      parsedResult.map(item => {
        jsonData.push(item);
      });

      fs_writeFileSync(coverFile, JSON.stringify(jsonData), err => {
        if (err) console.log("write", err);
      });
    })
    .catch(err => {
      console.log(err);
    });
};

export { readFileAsync, fs_writeFileSync, fs_appendFileSync, exportResult };
