import fs from "fs";
import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt"
  // userDict: "./jieba/userdict.utf8"
});

import synonyms from "node-synonyms";

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

//import { replaceCumulative } from "./src/ArrayProcess";

const replaceCumulative = (Sentence, FindList, ReplaceList, word) => {
  if (word == "n") {
    for (let i = 0; i < FindList.length; i++) Sentence = Sentence.replace(new RegExp(FindList[i]), "(" + ReplaceList[i] + ")");
    return Sentence;
  }
  if (word == "v") {
    for (let i = 0; i < FindList.length; i++) Sentence = Sentence.replace(new RegExp(FindList[i]), "[" + ReplaceList[i] + "]");
    return Sentence;
  }
};

const KeywordCombinationReplaceAll = (ReplacedSentenceFile, CombinedWordFile) => {
  fs.readFile(ReplacedSentenceFile, "utf-8", (BeingReplaceError, BeingReplaceData) => {
    const BeingReplaceList = JSON.parse(BeingReplaceData);
    fs.readFile(CombinedWordFile, "utf-8", (BecomeDataError, BecomeData) => {
      const BecomeDataList = JSON.parse(BecomeData);

      // 迭代句子
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
              //判斷組合詞是否大於1 && black 與samsung 組合詞長度是否一樣

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

                  //console.log(ResultSentenceVerb);
                  // fs.appendFileSync("./file/output/replace1.txt", ResultSentenceVerb + "\n", err => {
                  //   if (err) throw err;
                  // });
                }
              }
            });
          });
        });
      });
    });
  });
};

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

const CalculationWordDistance = () => {
  fs.readFile("./file/output/SimilaritySentence1.json", "utf-8", (err, SentenceData) => {
    const SentenceList = JSON.parse(SentenceData);

    const i = 500;
    nodejieba.cut(SentenceList[i]).map(CutValue => {
      nodejieba.tag(CutValue).map(SentenceTagValueOne => {
        if (SentenceTagValueOne.tag == "n") {
          synonyms.nearby(sify(SentenceTagValueOne.word)).then(nearbyValue => {
            console.log("原始句      =>", SentenceList[i]);
            nearbyValue[0].map(item => {
              console.log("替換同義詞後=>", SentenceList[i].replace(SentenceTagValueOne.word, "【" + tify(item) + "】"));

              // fs.appendFileSync(
              //   "./file/output/CreateSimilaritySentence.txt",
              //   SentenceList[i].replace(SentenceTagValueOne.word, "【" + tify(item) + "】") + "\n",
              //   err => {
              //     if (err) throw err;
              //   }
              // );
            });
          });
        }
      });
    });

    //     synonyms.compare(sify(SentenceValueOne.word), sify(SentenceValueTwo.word)).then(similarity => {
    //       if (SentenceValueOne.word !== SentenceValueTwo.word && similarity.toFixed(3) >= 0.5) {
    //         console.log(
    //           "\n句一=>",
    //           Sentence1,
    //           "\n句二=>",
    //           Sentence2,
    //           "\nkeyword相似度=>",
    //           similarity.toFixed(3),
    //           SentenceValueOne.word,
    //           SentenceValueTwo.word
    //         );
    //       }
    //     });
  });
};

KeywordCombinationReplaceAll("./file/data.json", "./file/Combination.json");

//SearchSimilarSentences("./file/replace.json", "./file/Reference.json");
