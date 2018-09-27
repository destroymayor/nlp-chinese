import process from "process";
import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt",
  stopWordDict: "./jieba/stop_words.utf8"
  // userDict: "./jieba/userdict.utf8"
});

import { readFileAsync, fs_appendFileSync, fs_writeFileSync } from "./src/fs";
import { replaceCumulative } from "./src/ArrayProcess.js";

//dice
import stringSimilarity from "string-similarity";
//levenshtein
import { similarity } from "./src/Calculation";
import wuzzy from "wuzzy";

//詞組合句子生成
const KeywordCombinationReplaceAll = (ReplacedSentenceFile, CombinedWordFile, output, GenerationsNumber) => {
  //產生句數量計數
  let num = 0;
  const outputList = [];
  readFileAsync(ReplacedSentenceFile).then(BeingReplaceData => {
    readFileAsync(CombinedWordFile).then(BecomeData => {
      Object.values(JSON.parse(BeingReplaceData)).map(BlackSentenceItem => {
        BlackSentenceItem.map(item => {
          const BeingReplaceListTagNoun = [];
          const BeingReplaceListTagVerb = [];

          // BlackCat Noun and Verb list
          nodejieba.cut(item.article_title).map(CutValue => {
            nodejieba.tag(CutValue).map(CutTagValue => {
              //Noun and word length > 1
              if (CutTagValue.tag === "n" && CutTagValue.word.length > 1) {
                BeingReplaceListTagNoun.push(CutTagValue.word);
              }
              // //Verb and word length > 1
              if (CutTagValue.tag === "v" && CutTagValue.word.length > 1) {
                BeingReplaceListTagVerb.push(CutTagValue.word);
              }
            });
          });

          Object.values(JSON.parse(BecomeData)).map(BecomeDataItem => {
            BecomeDataItem.item.map(BecomeDataItemValue => {
              if (BecomeDataItemValue.hasOwnProperty("v")) {
                if (
                  BeingReplaceListTagNoun.length === BecomeDataItemValue.n.length &&
                  BeingReplaceListTagVerb.length === BecomeDataItemValue.v.length
                ) {
                  //組合替換名詞
                  const ResultSentenceNoun = replaceCumulative(
                    item.article_title,
                    BeingReplaceListTagNoun,
                    BecomeDataItemValue.n
                  );

                  //組合替換動詞
                  const ResultSentenceVerb = replaceCumulative(
                    ResultSentenceNoun,
                    BeingReplaceListTagVerb,
                    BecomeDataItemValue.v
                  );

                  // const OutputResult =
                  //   "N:" + item.article_title + ", Q: " + ResultSentenceVerb + ", A: " + BecomeDataItemValue.sourceText + "\n";
                  // fs_appendFileSync(output, OutputResult, err => {
                  //   if (err) console.log("write", err);
                  // });

                  outputList.push({
                    question: ResultSentenceVerb,
                    answer: BecomeDataItemValue.sourceText
                  });

                  fs_writeFileSync(output, JSON.stringify(outputList), err => {
                    if (err) console.log("write", err);
                  });
                  //控制產生數量
                  num++;
                  if (num == GenerationsNumber) process.exit(0);
                }
              }
            });
          });
        });
      });
    });
  });
};

// 收斂 尋找QA最佳對
const SearchSimilarSentences = (GenerateSentenceFile, Threshold) => {
  readFileAsync(GenerateSentenceFile).then(GenerateSentenceData => {
    JSON.parse(GenerateSentenceData).map(SentenceValue => {
      const Q = SentenceValue.question;
      const A = SentenceValue.answer;
      //dice
      if (stringSimilarity.compareTwoStrings(Q, A) > Threshold) {
        console.log("dice", stringSimilarity.compareTwoStrings(Q, A).toFixed(3), "Q=> ", Q, "A=> ", A);
      }

      //jaccard
      if (wuzzy.jaccard(Q, A) > Threshold) {
        console.log("jaccard", wuzzy.jaccard(Q, A).toFixed(3), "Q=> ", Q, "A=> ", A);
      }

      // levenshtein
      if (wuzzy.levenshtein(Q, A) >= Threshold) {
        console.log("levenshtein ", wuzzy.levenshtein(Q, A).toFixed(3), "Q=> ", Q, "A=> ", A);
      }
    });
  });
};

// KeywordCombinationReplaceAll(
//   "./file/phone/phone.json",
//   "./file/Samsung/Samsung_Combination.json",
//   "./file/output/QA.json",
//   10000
// );

SearchSimilarSentences("./file/output/QA.json", 0.4);
