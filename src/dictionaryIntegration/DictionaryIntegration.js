import fs from "fs";

const DictionaryIntegration = () => {
  const lineReader = require("readline").createInterface({
    input: fs.createReadStream(__dirname + "/new_dict.txt")
  });
  const list = [];
  lineReader.on("line", line => {
    list.push(line);
    const file = [...new Set(list)];
    fs.writeFile("./dict.json", JSON.stringify(file), err => {
      if (err) throw err;
    });
  });
  // fs.readFile("./dict.json", "utf-8", (err, data) => {
  //   if (err) throw err;
  //   console.log(data);
  //   JSON.parse(data).map(item => {
  //     fs.appendFile("./dict.txt", item + "\n", error => {
  //       if (error) throw error;
  //     });
  //   });
  // });
};

export { DictionaryIntegration };
