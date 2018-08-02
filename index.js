import fs from "fs";
import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt",
  userDict: "./jieba/userdict.utf8"
});

import stringSimilarity from "string-similarity";

//import synonyms from "node-synonyms";

import {
  tify, //tify=轉成正體中文
  sify
} from "chinese-conv";

import { similarity, DeduplicationMergedObject2 } from "./src/Calculation";
import { replaceCumulative } from "./src/ArrayProcess";
import { DictionaryIntegration } from "./src/dictionaryIntegration/DictionaryIntegration";

const KeywordCombinationReplaceAll = () => {
  fs.readFile("./file/Black/BlackCat_ExtendedQuestion.json", "utf-8", (BlackSentenceError, BlackSentenceData) => {
    const BlackSentenceList = JSON.parse(BlackSentenceData);
    fs.readFile("./file/Samsung/Samsung_LocalCombination.json", "utf-8", (SamsungSentenceError, SamsungSentenceData) => {
      const SamsungSentenceList = JSON.parse(SamsungSentenceData);

      // 迭代句子
      BlackSentenceList.map(BlackSentence => {
        // BlackCat Noun and Verb list
        const BlackSentenceListTagNoun = [];
        const BlackSentenceListTagVerb = [];

        nodejieba.cut(BlackSentence).map(CutValue => {
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
            //判斷組合詞是否大於1 && black 與samsung 組合詞長度是否一樣
            if (
              SamsungWordValue.n &&
              SamsungWordValue.v !== undefined &&
              BlackSentenceListTagNoun.length === SamsungWordValue.n.length &&
              BlackSentenceListTagVerb.length === SamsungWordValue.v.length
            ) {
              //先替換名詞
              const replaceSentenceNoun = replaceCumulative(BlackSentence, BlackSentenceListTagNoun, SamsungWordValue.n);
              const replaceSentenceVerb = replaceCumulative(replaceSentenceNoun, BlackSentenceListTagVerb, SamsungWordValue.v);
              console.log(replaceSentenceVerb);

              // fs.appendFileSync("./file/output/replaceSentenceList.txt", '"' + replaceSentenceVerb + '",\n', err => {
              //   if (err) throw err;
              // });
            }
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
    //Similarity Sentence list
    const SearchSentenceResultList = [];
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
          if (
            stringSimilarity.compareTwoStrings(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr[SentenceIndex]) > 0.2
          ) {
            console.log(
              "相似度=",
              stringSimilarity
                .compareTwoStrings(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr[SentenceIndex])
                .toFixed(3),
              "輸入句= ",
              SearchSentenceListValue,
              " 相似句=> ",
              SentenceValue
            );
          }

          //判斷相似度
          if (similarity(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr[SentenceIndex]) >= 0.5) {
            // console.log(
            //   "相似度=",
            //   similarity(SentenceValue, SearchSentenceListValue).toFixed(3),
            //   "輸入句= ",
            //   SearchSentenceListValue,
            //   " 相似句=> ",
            //   SentenceValue
            // );
            // fs.appendFileSync(
            //   "./file/output/SimilaritySentence.txt",
            //   "相似度=" +
            //     similarity(SentenceValue, SearchSentenceListValue).toFixed(3) +
            //     "  輸入句=> " +
            //     SearchSentenceListValue +
            //     "  相似句=> " +
            //     SentenceValue +
            //     "\n",
            //   err => {
            //     if (err) throw err;
            //   }
            // );
            // SearchSentenceResultList.push({
            //   SearchSentence: SearchSentenceListValue,
            //   SimilaritySentence: SentenceValue
            // });
            // fs.writeFile("./file/output/SearchSentence.json", JSON.stringify(SearchSentenceResultList), err => {
            //   if (err) throw err;
            // });
          }
        });
        //---------------------------//

        //-------- 詞組合方法 --------//
        // const SearchWordCom = ["裝置", "可以", "傳輸線"];
        // if (SentenceValue.match(new RegExp(SearchWordCom[0] + ".*?" + SearchWordCom[1] + ".*?" + SearchWordCom[2]))) {
        //  // console.log("詞組合=[裝置, 可以, 傳輸線] =>", SentenceValue);
        // }
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
        //   const PartOfSpeechCombination = "nvnnv";
        //   const POSCombination = POSCombinationValue.tag.toString().replace(new RegExp(",", "g"), "");
        //   if (PartOfSpeechCombination === POSCombination) {
        //     //console.log("\n相似句=", POSCombinationValue.sentence, "\n詞性組合=", POSCombination);
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

//KeywordCombinationReplaceAll();

SearchSimilarSentences();

//CalculationWordDistance();

//console.log(lcs("啟動聯絡人應用程式並選擇您的個人資料", "圖示從早上選取到現在應用程式並選擇您"));

// console.log(stringSimilarity.compareTwoStrings("啟動聯絡人應用程式並選擇您的個人資料", "選取到現在應用程式並選擇您"));
// console.log(stringSimilarity.findBestMatch("healed", ["edward", "sealed", "theatre"]));
