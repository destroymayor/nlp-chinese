import fs from "fs";
import nodejieba from "nodejieba";

import util from "util";
const fs_writeFile = util.promisify(fs.writeFileSync);

nodejieba.load({
  dict: "./jieba/dict.txt",
  stopWordDict: "./jieba/stop_words.utf8",
  userDict: "./jieba/userdict.utf8"
});

// read file async
const readFileAsync = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const writeAsyncFile = (output, result) => {
  return new Promise((resolve, reject) => {
    fs.appendFileSync(output, result + "\n", err => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

const splitMulti = (str, tokens) => {
  let tempChar = tokens[0];
  for (let i = 1; i < tokens.length; i++) {
    str = str.split(tokens[i]).join(tempChar);
  }
  str = str.split(tempChar);
  return str;
};

const replaceRegex = text => {
  //去除特殊符號
  const SpecialSymbolCode =
    "[◢◤▏│█┌─┐└┬┘●■␂`-~～!@#$^&*()=－|「」{}╮╯╰╭\"'・：；:;'[\\].<>/?~！@#￥……﹏&*（）——|{}『』《》【】✪Ψ．、‘”“'%+_-ʎǝɹſʎɯǝ]";
  //去表情符號
  const EmojiCode = "([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])";
  if (text != null) {
    return text
      .replace(new RegExp(SpecialSymbolCode, "g"), "")
      .replace(new RegExp(EmojiCode, "g"), "")
      .replace(/  +/g, ""); //去多餘空白
  }
};

const RegexSpaceAndNumber = text => {
  //將數字以特定文字代替
  const NumberCode = "\\d+";
  return text
    .replace(/\s\s+/g, " ")
    .replace(/^ /g, "") //去空白跟起頭空白
    .replace(new RegExp(NumberCode, "g"), "Number");
};

const TrainDataProcess = async (input, output) => {
  const TrainData = await readFileAsync(input);
  Object.values(JSON.parse(TrainData).articles).map(item => {
    const title = replaceRegex(item.article_title);
    const content = replaceRegex(item.content);
    const messages = [];

    item.messages.map(item => {
      const replyItem = replaceRegex(item);
      messages.push(replyItem);
    });

    const CutTitle = nodejieba.cut(title, true).join(" ");
    splitMulti(CutTitle, [",", "，", "。", "？", "?"]).map(sentence => {
      const result = RegexSpaceAndNumber(sentence);
      if (result.length >= 10 && result.length <= 100) {
        writeAsyncFile(output, result);
      }
    });

    // const CutContent = nodejieba.cut(content, true).join(" ");
    // splitMulti(CutContent, [",", "，", "。", "？", "?"]).map(sentence => {
    //   const result = RegexSpaceAndNumber(sentence);
    //   if (result.length >= 10 && result.length <= 100) {
    //     writeAsyncFile(output, result);
    //   }
    // });

    // const CutMessages = nodejieba.cut(messages, true).join(" ");
    // splitMulti(CutMessages, [",", "，", "。", "？", "?"]).map(sentence => {
    //   const result = RegexSpaceAndNumber(sentence);
    //   if (result.length >= 10 && result.length <= 100) {
    //     writeAsyncFile(output, result);
    //   }
    // });
  });
};

//TrainDataProcess("./file/phone/MobileComm-1-6509.json", "./file/output/train.txt");

const lineReader = require("readline").createInterface({
  input: require("fs").createReadStream("./file/data.txt")
});

lineReader.on("line", function(line) {
  const data = replaceRegex(line);
  const CutTitle = nodejieba.cut(data, true).join(" ");
  console.log(CutTitle);
  splitMulti(CutTitle, [",", "，", "。", "？", "?"]).map(sentence => {
    console.log(sentence);
    writeAsyncFile("./file/train.txt", sentence);
  });
});
