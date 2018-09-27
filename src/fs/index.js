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

export { readFileAsync, fs_writeFileSync, fs_appendFileSync };
