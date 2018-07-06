import nodejieba from "nodejieba";
// 載入字典
nodejieba.load({ dict: "./jieba/dict.txt" });

// file process
import fs from "fs";

//繁轉簡  tify=轉成正體中文
import { tify, sify } from "chinese-conv";

import { replaceCumulative } from "./src/ArrayProcess";

import { similarity } from "./src/Calculation";

//同義詞
import synonyms from "node-synonyms";

//替換所有名詞
const CombinationReplaceAll = () => {
  fs.readFile("./file/Black/Black_CombinationAppearsSentence.json", "utf-8", (err, BlackSentenceData) => {
    const BlackSentenceList = JSON.parse(BlackSentenceData);
    fs.readFile("./file/Samsung/Samsung_CombinationAppearsSentence.json", "utf-8", (err, SamsungSentenceData) => {
      const SamsungSentenceList = JSON.parse(SamsungSentenceData).map(item => item);

      const BlackSentenceNoun = BlackSentenceList.map(item => {
        const total = [];
        nodejieba.tag(item.Sentence).map(value => {
          if (value.tag == "n" || value.tag == "v") {
            total.push(value.word);
          }
        });
        //過濾重複的詞
        const result = [...new Set(total)];
        return result;
      });
      const BlackKeywordList = [].concat(...BlackSentenceNoun);
      const BlackKeywordResult = [...new Set(BlackKeywordList)];

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

        //////
        //過濾名詞、動詞 list
        const BlackSentenceListTagArrayFilterNoun = BlackSentenceListTagArrayNoun.filter(element => {
          BlackKeywordResult.includes(element);
        });

        const BlackSentenceListTagArrayFilterVerb = BlackSentenceListTagArrayVerb.filter(element =>
          BlackKeywordResult.includes(element)
        );

        ////

        //replace 3054
        const replaceIndex = 1240;
        //先替換名詞
        const replaceNoun = replaceCumulative(
          BlackValue.Sentence,
          BlackSentenceListTagArrayNoun,
          SamsungSentenceNoun[replaceIndex],
          "n"
        );

        //替換動詞
        const replaceVerb = replaceCumulative(
          replaceNoun,
          BlackSentenceListTagArrayFilterVerb,
          SamsungSentenceVerb[replaceIndex],
          "v"
        );

        console.log(replaceVerb);
        fs.appendFile("./file/output/AllReplace1.json", "'" + replaceVerb + "'" + ",", err => {
          if (err) throw err;
        });
      });
    });
  });
};

//CombinationReplaceAll();

// 收斂 尋找相似句子
const SearchSimilarSentences = () => {
  fs.readFile("./file/output/AllReplace.json", "utf-8", (err, data) => {
    if (err) throw err;
    const SentenceDataList = JSON.parse(data);

    console.log(SentenceDataList.length);
    //相似句 list
    const SearchSentenceResultList = [];
    const SearchSentence = "裝置可以接上電源嗎";
    const SearchWordCom = ["裝置", "可以", "傳輸線"];

    //迭代語料庫所有句子
    SentenceDataList.map(SentenceValue => {
      //句子相似度配對

      // levenshtein
      if (similarity(SearchSentence, SentenceValue) >= 0.5) {
        SearchSentenceResultList.push(SentenceValue);
        console.log("levenshtein相似句= ", similarity(SearchSentence, SentenceValue).toFixed(3), SentenceValue);
      }
      //--------//

      // 詞組合
      if (SentenceValue.match(new RegExp(SearchWordCom[0] + ".*?" + SearchWordCom[1] + ".*?" + SearchWordCom[2]))) {
        //console.log("詞組合相似句= ", SentenceValue);
      }
      //--------//

      //// 詞性組合
      const PartOfSpeechCombination = [];
      synonyms.tag(SentenceValue).map(SentenceTagItem => {
        if (SentenceTagItem.tag == "n" || SentenceTagItem.tag == "v") {
          PartOfSpeechCombination.push({ sentence: SentenceValue, tag: SentenceTagItem.tag });
        }
      });
      const seen = {};
      const PartOfSpeechCombinationList = PartOfSpeechCombination.filter(entry => {
        let previous;
        if (seen.hasOwnProperty(entry.sentence)) {
          previous = seen[entry.sentence];
          previous.tag.push(entry.tag);
          return false;
        }
        if (!Array.isArray(entry.tag)) {
          entry.tag = [entry.tag];
        }
        seen[entry.sentence] = entry;
        return true;
      });

      PartOfSpeechCombinationList.map(item => {
        if ("nvn".includes(item.tag.toString().replace(new RegExp(",", "g"), ""))) {
          //console.log("\n相似句=", item.sentence, "\n詞性組合=", item.tag);
        }
      });
      //--------//
    });

    //計算斷詞後剩餘詞在向量裡的距離
    // const SentenceTagListOne = [];
    // const SentenceTagListTwo = [];
    // //句1作斷詞後只取 n v
    // synonyms.tag(SearchSentence).map(SentenceTagValueOne => {
    //   if (SentenceTagValueOne.tag == "n" || SentenceTagValueOne.tag == "v") {
    //     SentenceTagListOne.push(SentenceTagValueOne);
    //   }
    // });

    // //句2作斷詞後只取 n v
    // synonyms.tag(SearchSentenceResultList[3]).map(SentenceTagValueTwo => {
    //   if (SentenceTagValueTwo.tag == "n" || SentenceTagValueTwo.tag == "v") {
    //     SentenceTagListTwo.push(SentenceTagValueTwo);
    //   }
    // });

    // SentenceTagListOne.map(SentenceValueOne => {
    //   SentenceTagListTwo.map(SentenceValueTwo => {
    //     synonyms.compare(sify(SentenceValueOne.word), sify(SentenceValueTwo.word)).then(similarity => {
    //       if (SentenceValueOne.word !== SentenceValueTwo.word) {
    //         console.log(similarity.toFixed(3), SentenceValueOne.word, SentenceValueTwo.word);
    //       }
    //     });
    //   });
    // });
  });
};

//CombinationReplaceAll();

SearchSimilarSentences();
