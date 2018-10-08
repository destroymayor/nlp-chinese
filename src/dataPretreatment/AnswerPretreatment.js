import nodejieba from "nodejieba";
nodejieba.load({
  dict: "./jieba/dict.txt",
  stopWordDict: "./jieba/stop_words.utf8"
});

import { promisify } from "util";
import fs from "fs";
const fs_writeFileSync = promisify(fs.writeFileSync);

import { readFileAsync } from "../fsAsync";

import { combinations } from "simple-statistics";

const Process = async (sourceText, output) => {
  const sourceTextData = await readFileAsync(sourceText);
  const Result = [];

  JSON.parse(sourceTextData).map(RegulationValue => {
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

    //merger
    const results = NounList.map((item, i) => Object.assign({}, item, VerbList[i]));
    if (results.length > 0) {
      Result.push({
        item: results
      });
    }
  });

  fs_writeFileSync(output, JSON.stringify(Result, null, 2));
};

Process("./file/Samsung/SamsungSentence_List.json", "./file/Samsung/Samsung_Combination.json");
