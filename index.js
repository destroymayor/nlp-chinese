import nodejieba from "nodejieba";
nodejieba.load({ dict: "./jieba/dict.txt" });

// file process
import fs from "fs";
//繁轉簡  tify=轉成正體中文
import { tify, sify } from "chinese-conv";

import { replaceCumulative, removeDuplicates, DeduplicationMergedObject2 } from "./src/ArrayProcess";
import { similarity } from "./src/Calculation";

//同義詞
//import synonyms from "node-synonyms";

//替換所有名詞或動詞
const CombinationReplaceAll = () => {
  fs.readFile("./file/Black/Black_CombinationAppearsSentence.json", "utf-8", (err, BlackSentenceData) => {
    const BlackSentenceList = JSON.parse(BlackSentenceData);
    fs.readFile("./file/Samsung/Samsung_CombinationAppearsSentence.json", "utf-8", (err, SamsungSentenceData) => {
      const SamsungSentenceList = JSON.parse(SamsungSentenceData).map(item => item);

      // const BlackSentenceNoun = BlackSentenceList.map(item => {
      //   const total = [];
      //   nodejieba.tag(item.Sentence).map(value => {
      //     if (value.tag == "n" || value.tag == "v") {
      //       total.push(value.word);
      //     }
      //   });
      //   //過濾重複的詞
      //   const result = [...new Set(total)];
      //   return result;
      // });
      // const BlackKeywordList = [].concat(...BlackSentenceNoun);
      // const BlackKeywordResult = [...new Set(BlackKeywordList)];

      //Samsung句子斷詞取名詞
      const SamsungSentenceNoun = SamsungSentenceList.map(item => {
        const total = [];
        nodejieba.tag(item.Sentence).map(value => {
          if (value.tag == "n") {
            total.push(value.word);
          }
        });
        //過濾重複的詞
        const result = [...new Set(total)];
        return result;
      });

      //Samsung句子斷詞取動詞
      const SamsungSentenceVerb = SamsungSentenceList.map(item => {
        const total = [];
        nodejieba.tag(item.Sentence).map(value => {
          if (value.tag == "v") {
            total.push(value.word);
          }
        });
        //過濾重複的詞
        const result = [...new Set(total)];
        return result;
      });

      // 迭代所有句子
      BlackSentenceList.map(BlackValue => {
        //名詞、動詞 list
        const BlackSentenceListTagArrayNoun = [];
        const BlackSentenceListTagArrayVerb = [];
        nodejieba.tag(BlackValue.Sentence).map(BlackSentenceListTagValue => {
          //判斷是名詞
          if (BlackSentenceListTagValue.tag == "n" && BlackSentenceListTagValue.word.length > 1) {
            BlackSentenceListTagArrayNoun.push(BlackSentenceListTagValue.word);
          }
          //判斷是動詞
          if (BlackSentenceListTagValue.tag == "v" && BlackSentenceListTagValue.word.length > 1) {
            BlackSentenceListTagArrayVerb.push(BlackSentenceListTagValue.word);
          }
        });

        //replace 3054
        const i = 20;
        //先替換名詞
        const replaceNoun = replaceCumulative(BlackValue.Sentence, BlackSentenceListTagArrayNoun, SamsungSentenceNoun[i], "n");

        //替換動詞
        const replaceVerb = replaceCumulative(replaceNoun, BlackSentenceListTagArrayVerb, SamsungSentenceVerb[i], "v");

        console.log(
          BlackValue.Sentence,
          "\nblack   n=",
          BlackSentenceListTagArrayNoun.toString(),
          " v=",
          BlackSentenceListTagArrayVerb.toString(),
          "\nsamsung n=",
          SamsungSentenceNoun[i].toString(),
          " v=",
          SamsungSentenceVerb[i].toString(),
          "\n",
          replaceVerb,
          "\n"
        );

        // fs.appendFile("./file/output/AllReplace1.json", "'" + replaceVerb + "'" + ",", err => {
        //   if (err) throw err;
        // });
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
          if (similarity(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr[SentenceIndex]) >= 0.5) {
            // console.log(
            //   "相似度=",
            //   similarity(SentenceValue, SearchSentenceListValue).toFixed(3),
            //   "輸入句= ",
            //   SearchSentenceListValue,
            //   "=> 相似句= ",
            //   SentenceValue
            // );
            SearchSentenceResultList.push({ SearchSentence: SearchSentenceListValue, SimilaritySentence: SentenceValue });
            // fs.writeFile("./file/output/SearchSentence.json", JSON.stringify(SearchSentenceResultList), err => {
            //   if (err) throw err;
            // });
          }
        });
        //---------------------------//

        //-------- 詞組合方法 --------//
        const SearchWordCom = ["裝置", "可以", "傳輸線"];
        if (SentenceValue.match(new RegExp(SearchWordCom[0] + ".*?" + SearchWordCom[1] + ".*?" + SearchWordCom[2]))) {
          // console.log("詞組合=[裝置, 可以, 傳輸線] =>", SentenceValue);
        }
        //---------------------------//

        //-------- 詞性組合方法 --------//
        const PartOfSpeechCombinationList = [];
        synonyms.tag(SentenceValue).map(SentenceTagItem => {
          if (SentenceTagItem.tag == "n" || SentenceTagItem.tag == "v") {
            PartOfSpeechCombinationList.push({ sentence: SentenceValue, tag: SentenceTagItem.tag });
          }
        });

        DeduplicationMergedObject2(PartOfSpeechCombinationList).map(POSCombinationValue => {
          const PartOfSpeechCombination = "nvnvvnv";
          const POSCombination = POSCombinationValue.tag.toString().replace(new RegExp(",", "g"), "");
          if (PartOfSpeechCombination === POSCombination) {
            console.log("\n相似句=", POSCombinationValue.sentence, "\n詞性組合=", POSCombination);
          }
        });
        //---------------------------//
      });
    });
  });
};

//計算斷詞後剩餘詞在向量裡的距離
const CalculationWordDistance = () => {
  fs.readFile("./file/output/SearchSentence.json", "utf-8", (err, SentenceData) => {
    const SentenceList = removeDuplicates(JSON.parse(SentenceData), "SimilaritySentence");

    //句1作斷詞後只取 n v
    const SentenceTagListOne = [];
    synonyms.tag(SentenceList[50].SearchSentence).map(SentenceTagValueOne => {
      if (SentenceTagValueOne.tag == "n" || SentenceTagValueOne.tag == "v") {
        SentenceTagListOne.push(SentenceTagValueOne);
      }
    });

    // //句2作斷詞後只取 n v
    const SentenceTagListTwo = [];
    synonyms.tag(SentenceList[50].SimilaritySentence).map(SentenceTagValueTwo => {
      if (SentenceTagValueTwo.tag == "n" || SentenceTagValueTwo.tag == "v") {
        SentenceTagListTwo.push(SentenceTagValueTwo);
      }
    });

    SentenceTagListOne.map(SentenceValueOne => {
      SentenceTagListTwo.map(SentenceValueTwo => {
        synonyms.compare(sify(SentenceValueOne.word), sify(SentenceValueTwo.word)).then(similarity => {
          if (SentenceValueOne.word !== SentenceValueTwo.word && similarity.toFixed(3) >= 0.5) {
            console.log(
              SentenceList[0].SearchSentence,
              SentenceList[0].SimilaritySentence,
              similarity.toFixed(3),
              SentenceValueOne.word,
              SentenceValueTwo.word
            );
          }
        });
      });
    });
  });
};

CombinationReplaceAll();

//SearchSimilarSentences();

//CalculationWordDistance();
