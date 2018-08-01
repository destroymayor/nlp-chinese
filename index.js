import fs from "fs";
import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt",
  userDict: "./jieba/userdict.utf8"
});

import {
  similarity,
  DeduplicationMergedObject2
} from './src/Calculation'

import {
  removeDuplicates
} from './src/ArrayProcess'

const KeywordCombinationReplaceAll = () => {
  fs.readFile("./file/Black/Black_Test.json", "utf-8", (BlackSentenceError, BlackSentenceData) => {
    const BlackSentenceList = JSON.parse(BlackSentenceData);
    fs.readFile("./file/Samsung/Samsung_Test.json", "utf-8", (SamsungSentenceError, SamsungSentenceData) => {
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
              console.log(BlackSentence, "替換後=>" + replaceSentenceVerb);
            }
          });
        });
      });
    });
  });
};

// 收斂 尋找相似句子
const SearchSimilarSentences = () => {
  fs.readFile("./file/output/AllReplace.json", "utf-8", (err, SentenceDataList) => {
    if (err) throw err;

    //Similarity Sentence list
    const SearchSentenceResultList = [];
    // Samsung Sentence list
    const SamsungSentenceListArray = [];
    //迭代所有Samsung句子
    fs.readFile("./file/Samsung/Samsung_CombinationAppearsSentence.json", "utf-8", (error, SamsungSentenceData) => {
      if (error) throw error;

      JSON.parse(SamsungSentenceData).map(SamsungSentenceListValue => {
        SamsungSentenceListArray.push(SamsungSentenceListValue.Sentence);
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
          if (similarity(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr[SentenceIndex]) >= 0.8) {
            console.log(
              "相似度=",
              similarity(SentenceValue, SearchSentenceListValue).toFixed(3),
              "輸入句= ",
              SearchSentenceListValue,
              "=> 相似句= ",
              SentenceValue
            );

            // SearchSentenceResultList.push({
            //   SearchSentence: SearchSentenceListValue,
            //   SimilaritySentence: SentenceValue
            // });

            // fs.appendFileSync(
            //   "./file/output/SimilaritySentence.txt",
            //   "相似度=" +
            //   similarity(SentenceValue, SearchSentenceListValue).toFixed(3) +
            //   " Samsung句子=> " +
            //   SearchSentenceListValue +
            //   " | 相似句=> " +
            //   SentenceValue +
            //   "\n",
            //   err => {
            //     if (err) throw err;
            //   }
            // );
            // fs.writeFile("./file/output/SearchSentence.json", JSON.stringify(SearchSentenceResultList), err => {
            //   if (err) throw err;
            // });
          }
        });
        //---------------------------//

        //-------- 詞組合方法 --------//
        const SearchWordCom = ["裝置", "可以", "傳輸線"];
        if (SentenceValue.match(new RegExp(SearchWordCom[0] + ".*?" + SearchWordCom[1] + ".*?" + SearchWordCom[2]))) {
          //console.log("詞組合=[裝置, 可以, 傳輸線] =>", SentenceValue);
        }
        //---------------------------//

        //-------- 詞性組合方法 --------//
        const PartOfSpeechCombinationList = [];
        nodejieba.cut(SentenceValue).map(CutValue => {
          nodejieba.tag(CutValue).map(SentenceTagItem => {
            if (SentenceTagItem.tag == "n" || SentenceTagItem.tag == "v") {
              PartOfSpeechCombinationList.push({
                sentence: SentenceValue,
                tag: SentenceTagItem.tag
              });
            }
          });
        });

        DeduplicationMergedObject2(PartOfSpeechCombinationList).map(POSCombinationValue => {
          const PartOfSpeechCombination = "nvnnv";
          const POSCombination = POSCombinationValue.tag.toString().replace(new RegExp(",", "g"), "");
          if (PartOfSpeechCombination === POSCombination) {
            //console.log("\n相似句=", POSCombinationValue.sentence, "\n詞性組合=", POSCombination);
          }
        });
        //---------------------------//
      });
    });
  });
};

//KeywordCombinationReplaceAll();
