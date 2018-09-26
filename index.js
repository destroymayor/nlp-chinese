import fs from "fs";
import process from "process";
import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt",
  stopWordDict: "./jieba/stop_words.utf8"
  // userDict: "./jieba/userdict.utf8"
});

import {
  tify, //tify=轉成正體中文
  sify
} from "chinese-conv";

import stringSimilarity from "string-similarity";

// import {
//   similarity,
//   longestCommonSubsequence,
//   levenshteinDistance,
//   metricLcs,
//   DeduplicationMergedObject2
// } from "./src/Calculation";

// replace function
const replaceCumulative = (Sentence, FindList, ReplaceList, word) => {
  if (word == "n") {
    for (let i = 0; i < FindList.length; i++) Sentence = Sentence.replace(new RegExp(FindList[i]), "(n" + ReplaceList[i] + ")");
    return Sentence;
  }
  if (word == "v") {
    for (let i = 0; i < FindList.length; i++) Sentence = Sentence.replace(new RegExp(FindList[i]), "[v" + ReplaceList[i] + "]");
    return Sentence;
  }
};

//詞組合句子生成
const KeywordCombinationReplaceAll = (ReplacedSentenceFile, CombinedWordFile, output, GenerationsNumber) => {
  //產生句數量計數
  let num = 0;
  fs.readFile(ReplacedSentenceFile, "utf-8", (BeingReplaceError, BeingReplaceData) => {
    const BeingReplaceList = JSON.parse(BeingReplaceData);
    fs.readFile(CombinedWordFile, "utf-8", (BecomeDataError, BecomeData) => {
      const BecomeDataList = JSON.parse(BecomeData);

      Object.values(BeingReplaceList).map(BlackSentenceItem => {
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

          Object.values(BecomeDataList).map(BecomeDataItem => {
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
                    BecomeDataItemValue.n,
                    "n"
                  );

                  //組合替換動詞
                  const ResultSentenceVerb = replaceCumulative(
                    ResultSentenceNoun,
                    BeingReplaceListTagVerb,
                    BecomeDataItemValue.v,
                    "v"
                  );

                  fs.appendFileSync(
                    output,
                    "N:" + item.article_title + ", Q: " + ResultSentenceVerb + ", A: " + BecomeDataItemValue.sourceText + "\n",
                    err => {
                      if (err) throw err;
                    }
                  );

                  //控制產生數量
                  num++;
                  if (num == GenerationsNumber) {
                    process.exit(0);
                  }
                }
              }
            });
          });
        });
      });
    });
  });
};

KeywordCombinationReplaceAll(
  "./file/phone/phone.json",
  "./file/Samsung/Samsung_Combination.json",
  "./file/output/QA.txt",
  300000
);

// 收斂 尋找相似句子
const SearchSimilarSentences = (GenerateSentenceFile, ReferenceSentenceFile) => {
  fs.readFile(GenerateSentenceFile, "utf-8", (err, GenerateSentenceData) => {
    if (err) throw err;

    fs.readFile(ReferenceSentenceFile, "utf-8", (error, ReferenceSentenceData) => {
      if (error) throw error;

      //迭代所有 ReferenceSentence
      JSON.parse(ReferenceSentenceData).map(ReferenceSentenceItem => {
        //迭代語料庫所有句子
        JSON.parse(GenerateSentenceData).map(GenerateSentenceValue => {
          //dice
          if (stringSimilarity.compareTwoStrings(ReferenceSentenceItem, GenerateSentenceValue) > 0.1) {
            console.log(
              stringSimilarity
                .compareTwoStrings(ReferenceSentenceTotal[ReferenceSentenceIndex], GenerateSentenceValue)
                .toFixed(3),
              GenerateSentenceValue
            );
          }
          // levenshtein
          // if (similarity(ReferenceSentenceTotal[ReferenceSentenceIndex], GenerateSentenceArr[GenerateSentenceIndex]) >= 0) {
          //   console.log(
          //     "levenshtein 相似度=> " +
          //       similarity(ReferenceSentenceTotal[ReferenceSentenceIndex], GenerateSentenceArr[GenerateSentenceIndex]).toFixed(3) +
          //       "  輸入句 => " +
          //       SearchSentenceListValue +
          //       "  相似句 => " +
          //       SentenceValue +
          //       "\n"
          //   );
          // }
        });
      });
    });
  });
};

//SearchSimilarSentences("./file/replace.json", "./file/Reference.json");
