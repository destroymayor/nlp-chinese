import process from "process";
import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt",
  stopWordDict: "./jieba/stop_words.utf8"
  // userDict: "./jieba/userdict.utf8"
});

import { readFileAsync, fs_appendFileSync } from "./src/fs";
import { replaceCumulative } from "./src/ArrayProcess.js";

//dice
import stringSimilarity from "string-similarity";
//levenshtein
import { similarity } from "./src/Calculation";

//詞組合句子生成
const KeywordCombinationReplaceAll = (ReplacedSentenceFile, CombinedWordFile, output, GenerationsNumber) => {
  //產生句數量計數
  let num = 0;
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

                  const OutputResult =
                    "N:" + item.article_title + ", Q: " + ResultSentenceVerb + ", A: " + BecomeDataItemValue.sourceText + "\n";
                  fs_appendFileSync(output, OutputResult, err => {
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

// KeywordCombinationReplaceAll(
//   "./file/phone/phone.json",
//   "./file/Samsung/Samsung_Combination.json",
//   "./file/output/QA1.txt",
//   10000
// );

// 收斂 尋找相似句子
const SearchSimilarSentences = (GenerateSentenceFile, ReferenceSentenceFile) => {
  readFileAsync(GenerateSentenceFile).then(GenerateSentenceData => {
    readFileAsync(ReferenceSentenceFile).then(ReferenceSentenceData => {
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
          if (similarity(ReferenceSentenceTotal[ReferenceSentenceIndex], GenerateSentenceArr[GenerateSentenceIndex]) >= 0) {
            console.log(
              "levenshtein 相似度=> " +
                similarity(ReferenceSentenceTotal[ReferenceSentenceIndex], GenerateSentenceArr[GenerateSentenceIndex]).toFixed(
                  3
                ) +
                "  輸入句 => " +
                SearchSentenceListValue +
                "  相似句 => " +
                SentenceValue +
                "\n"
            );
          }
        });
      });
    });
  });
};

//SearchSimilarSentences("./file/replace.json", "./file/Reference.json");
