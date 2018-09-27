import { combinations } from "simple-statistics";
import nodejieba from "nodejieba";
import fs from "fs";

import util from "util";
const fs_writeFile = util.promisify(fs.writeFileSync);

nodejieba.load({
  dict: "./jieba/dict.txt",
  stopWordDict: "./jieba/stop_words.utf8"
});

const readFileAsync = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

// file write
const exportResults = (parsedResults, coverFile) => {
  readFileAsync(coverFile)
    .then(data => {
      const jsonData = JSON.parse(data);
      parsedResults.map(item => {
        jsonData.push(item);
      });

      fs_writeFile(coverFile, JSON.stringify(jsonData), err => {
        if (err) console.log("write", err);
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const Process = async (sourceText, output) => {
  readFileAsync(sourceText)
    .then(data => {
      const jsonData = JSON.parse(data);
      const Result = [];

      jsonData.map(RegulationValue => {
        const KeywordListNoun = [];
        const KeywordListVerb = [];
        nodejieba.extract(RegulationValue, 20).map(item => {
          nodejieba.tag(item.word).map(TagValue => {
            if (TagValue.tag == "n") {
              KeywordListNoun.push(TagValue.word);
            }
            if (TagValue.tag == "v") {
              KeywordListVerb.push(TagValue.word);
            }
          });
        });

        const NounList = [];
        const VerbList = [];

        //名詞組合
        combinations(KeywordListNoun, 2).map(NounItem => {
          NounList.push({
            sourceText: RegulationValue,
            n: NounItem
          });
        });

        //動詞組合
        combinations(KeywordListVerb, 1).map(VerbItem => {
          VerbList.push({
            v: VerbItem
          });
        });

        //合併
        const results = NounList.map((item, i) => Object.assign({}, item, VerbList[i]));

        if (results.length > 0) {
          Result.push({
            item: results
          });
        }
      });

      exportResults(Result, output);
    })
    .catch(err => {
      console.log(err);
    });
};

Process("./file/Samsung/SamsungSentence_List.json", "./file/Samsung/Samsung_Combination.json");