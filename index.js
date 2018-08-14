import fs from "fs";
import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt",
  userDict: "./jieba/userdict.utf8"
});

import stringSimilarity from "string-similarity";
import JaroWinkler from "jaro-winkler";
import VectorSimilarity from "compute-cosine-similarity";

//import synonyms from "node-synonyms";

import {
  tify, //tify=轉成正體中文
  sify
} from "chinese-conv";

import {
  similarity,
  longestCommonSubsequence,
  levenshteinDistance,
  metricLcs,
  DeduplicationMergedObject2
} from "./src/Calculation";
//import { replaceCumulative } from "./src/ArrayProcess";
import { DictionaryIntegration } from "./src/dictionaryIntegration/DictionaryIntegration";

const replaceCumulative = (Sentence, FindList, ReplaceList) => {
  for (let i = 0; i < FindList.length; i++) {
    Sentence = Sentence.replace(new RegExp(FindList[i]), ReplaceList[i]);
  }
  return Sentence;
};

const KeywordCombinationReplaceAll = (ReplacedSentenceFile, CombinedWordFile) => {
  fs.readFile(ReplacedSentenceFile, "utf-8", (BlackSentenceError, BlackSentenceData) => {
    const BlackSentenceList = JSON.parse(BlackSentenceData);
    fs.readFile(CombinedWordFile, "utf-8", (SamsungSentenceError, SamsungSentenceData) => {
      const SamsungSentenceList = JSON.parse(SamsungSentenceData);

      // 迭代句子
      Object.keys(BlackSentenceList).map(BlackSentenceItem => {
        BlackSentenceList[BlackSentenceItem].filter(BlackSentenceValue => {
          // BlackCat Noun and Verb list
          const BlackSentenceListTagNoun = [];
          const BlackSentenceListTagVerb = [];

          nodejieba.cut(BlackSentenceValue).map(CutValue => {
            nodejieba.tag(CutValue).map(BlackSentenceListTagValue => {
              //Noun and word length > 1
              if (BlackSentenceListTagValue.tag === "n" && BlackSentenceListTagValue.word.length > 1) {
                BlackSentenceListTagNoun.push(BlackSentenceListTagValue.word);
              }
              //Verb and word length > 1
              if (BlackSentenceListTagValue.tag === "v" && BlackSentenceListTagValue.word.length > 1) {
                BlackSentenceListTagVerb.push(BlackSentenceListTagValue.word);
              }
            });
          });

          Object.keys(SamsungSentenceList).map(SamsungSentenceItem => {
            SamsungSentenceList[SamsungSentenceItem].filter(SamsungWordValue => {
              // console.log(SamsungWordValue);
              //判斷組合詞是否大於1 && black 與samsung 組合詞長度是否一樣
              if (
                SamsungWordValue.n &&
                SamsungWordValue.v !== undefined &&
                BlackSentenceListTagNoun.length === SamsungWordValue.n.length &&
                BlackSentenceListTagVerb.length === SamsungWordValue.v.length
              ) {
                //console.log(BlackSentenceListTagNoun, SamsungWordValue.n);
                //組合替換名詞
                const replaceSentenceNoun = replaceCumulative(BlackSentenceValue, BlackSentenceListTagNoun, SamsungWordValue.n);
                //組合替換動詞
                const replaceSentenceVerb = replaceCumulative(replaceSentenceNoun, BlackSentenceListTagVerb, SamsungWordValue.v);

                //console.log(replaceSentenceVerb);

                // fs.appendFileSync("./file/output/replaceSentenceListThree.json", '"' + replaceSentenceVerb + '",\n', err => {
                //   if (err) throw err;
                // });
              }
            });
          });
        });
      });
    });
  });
};

// 收斂 尋找相似句子
const SearchSimilarSentences = () => {
  fs.readFile("./file/output/replaceSentenceList.json", "utf-8", (err, SentenceDataList) => {
    if (err) throw err;
    // Samsung Sentence list
    const SamsungSentenceListArray = [];
    //迭代所有Samsung句子
    fs.readFile("./file/Samsung/SamsungSentence_List.json", "utf-8", (error, SamsungSentenceData) => {
      if (error) throw error;
      JSON.parse(SamsungSentenceData).map(SamsungSentenceListValue => {
        SamsungSentenceListArray.push(SamsungSentenceListValue);
      });

      //迭代語料庫所有句子
      JSON.parse(SentenceDataList).map((SentenceValue, SentenceIndex, SentenceValueArray) => {
        const SentenceValueArr = SentenceValueArray.map(item => item);
        //-------- levenshtein 句子對句子 --------//
        //Samsung sentence list
        const SearchSentenceList = [...new Set(SamsungSentenceListArray)];
        SearchSentenceList.map((SearchSentenceListValue, SearchSentenceIndex, SearchSentenceListArray) => {
          const SearchSentenceListArr = SearchSentenceListArray.map(item => item);

          //判斷相似度
          // if (JaroWinkler(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr[SentenceIndex]) >= 0.2) {
          //   // console.log(
          //   //   "jaro winkler 相似度=> " +
          //   //     JaroWinkler(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr[SentenceIndex]).toFixed(3) +
          //   //     "  輸入句 => " +
          //   //     SearchSentenceListValue +
          //   //     "  相似句 => " +
          //   //     SentenceValue +
          //   //     "\n"
          //   // );
          //   fs.appendFileSync(
          //     "./file/output/JaroWinkler.txt",
          //     "相似度=> " +
          //       JaroWinkler(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr[SentenceIndex]).toFixed(3) +
          //       "  輸入句 => " +
          //       SearchSentenceListValue +
          //       "  相似句 => " +
          //       SentenceValue +
          //       "\n",
          //     err => {
          //       if (err) throw err;
          //     }
          //   );
          // }

          // dice
          if (
            stringSimilarity.findBestMatch(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr).bestMatch.rating >= 0.2
          ) {
            // console.log(
            //   "dice 相似度=> " +
            //     stringSimilarity
            //       .findBestMatch(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr)
            //       .bestMatch.rating.toFixed(3),
            //   "\n  輸入句 => ",
            //   SearchSentenceListArr[SearchSentenceIndex],
            //   "\n  相似句 => ",
            //   stringSimilarity.findBestMatch(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr).bestMatch.target
            // );

            fs.appendFileSync(
              "./file/output/dice.txt",
              "輸入句 => " +
                SearchSentenceListArr[SearchSentenceIndex] +
                "   相似句 => " +
                stringSimilarity.findBestMatch(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr).bestMatch.target +
                "\n",
              err => {
                if (err) throw err;
              }
            );
          }

          // levenshtein
          // if (similarity(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr[SentenceIndex]) >= 0.5) {
          //   console.log(
          //     "levenshtein 相似度=> " +
          //       similarity(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr[SentenceIndex]).toFixed(3) +
          //       "  輸入句 => " +
          //       SearchSentenceListValue +
          //       "  相似句 => " +
          //       SentenceValue +
          //       "\n"
          //   );
          // }
        });
        //---------------------------//

        //-------- 詞性組合方法 --------//
        // const PartOfSpeechCombinationList = [];
        // nodejieba.cut(SentenceValue).map(CutValue => {
        //   nodejieba.tag(CutValue).map(SentenceTagItem => {
        //     if (SentenceTagItem.tag == "n" || SentenceTagItem.tag == "v") {
        //       PartOfSpeechCombinationList.push({
        //         sentence: SentenceValue,
        //         tag: SentenceTagItem.tag
        //       });
        //     }
        //   });
        // });

        // DeduplicationMergedObject2(PartOfSpeechCombinationList).map(POSCombinationValue => {
        //   const PartOfSpeechCombination = "nnnvvvv";
        //   const POSCombination = POSCombinationValue.tag.toString().replace(new RegExp(",", "g"), "");
        //   if (PartOfSpeechCombination === POSCombination) {
        //     console.log("\n相似句=", POSCombinationValue.sentence, "\n詞性組合=", POSCombination);
        //   }
        // });
        //---------------------------//
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

//KeywordCombinationReplaceAll("./file/Black/BlackCat_QAList.json", "./file/Samsung/Samsung_LocalCombination.json");

//SearchSimilarSentences();

//CalculationWordDistance();

// nodejieba.cut("你正做什麼").map(CutValue => {
//   synonyms.vector(sify(CutValue)).then(VectorValue => {
//     console.log(VectorValue);

//     //console.log(VectorValue.reduce((one, two) => one + two, 0) / VectorValue.length);
//   });
// });

// const QList = [];
// const AList = [];
// const q = "用過的電池使用還可以再次利用嗎？";
// const a = "請遵循當地所有法規棄置用過的電池或手機。";

// nodejieba.cut(q).map(CutValue => {
//   nodejieba.tag(CutValue).map(SentenceTagItem => {
//     console.log(SentenceTagItem);
//     QList.push(SentenceTagItem.word);
//   });
// });

// nodejieba.cut(a).map(CutValue => {
//   nodejieba.tag(CutValue).map(SentenceTagItem => {
//     console.log(SentenceTagItem);
//     AList.push(SentenceTagItem.word);
//   });
// });

// // console.log(QList.toString());
// // console.log(AList.toString());

// console.log(nodejieba.extract(q, 20));
// console.log(nodejieba.extract(a, 20));
