import nodejieba from "nodejieba";

// 載入字典
nodejieba.load({ dict: "./jieba/dict.txt" });

// file process
import fs from "fs";

//繁轉簡  tify=轉成正體中文
import { tify, sify } from "chinese-conv";

import Fastlevenshtein from "fast-levenshtein";
import { replaceBulk, replaceCumulative, removeDuplicates } from "./src/arrayProcess";

import {
  similarity
  // levenshteinDistance,
  // longestCommonSubstring,
  // longestCommonSubsequnce,
  // shortestCommonSupersequence
} from "./src/Calculation";

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
        //名詞list
        const BlackSentenceListTagArrayNoun = [];
        //動詞list
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
        //過濾名詞list
        const BlackSentenceListTagArrayFilterNoun = BlackSentenceListTagArrayNoun.filter(element =>
          BlackKeywordResult.includes(element)
        );

        //過濾動詞list
        const BlackSentenceListTagArrayFilterVerb = BlackSentenceListTagArrayVerb.filter(element =>
          BlackKeywordResult.includes(element)
        );
        ////

        //replace
        //先替換名詞
        const replaceIndex = 131;
        const replaceNoun = replaceCumulative(
          BlackValue.Sentence,
          BlackSentenceListTagArrayFilterNoun,
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

        fs.appendFile("./file/output/AllReplace.json", "'" + replaceVerb + "'" + ",", err => {
          if (err) throw err;
        });

        // fs.appendFile(
        //   "./file/output/Black_AllReplace.txt",
        //   "\nblack 名詞= " +
        //     BlackSentenceListTagArrayFilterNoun +
        //     " | 動詞= " +
        //     BlackSentenceListTagArrayFilterVerb +
        //     "\n原句子 => " +
        //     BlackValue.Sentence +
        //     "\n替換後 => " +
        //     replaceVerb +
        //     "\n",
        //   err => {
        //     if (err) throw err;
        //   }
        // );
      });
    });
  });
};

// 收斂 尋找相似句子
const searchSimilarSentences = SearchSentence => {
  fs.readFile("./file/output/AllReplace.json", "utf-8", (err, data) => {
    if (err) throw err;
    const SentenceDataList = JSON.parse(data);

    //相似句的list
    const SearchSentenceResultList = [];
    //迭代語料庫所有句子
    SentenceDataList.map(SentenceValue => {
      //句子相似度配對
      if (similarity(SearchSentence, SentenceValue) >= 0.6) {
        SearchSentenceResultList.push(SentenceValue);
        console.log("相似句= ", SentenceValue);
        synonyms.tag(SentenceValue).map(SentenceTagValue => {
          //console.log(SentenceValue, SentenceTagValue);
        });
      }
    });

    //計算斷詞後剩餘詞在向量裡的距離
    const SentenceTagList1 = [];
    const SentenceTagList2 = [];
    //句1作斷詞後只取 n v
    synonyms.tag(SearchSentence).map(SentenceTagValue1 => {
      if (SentenceTagValue1.tag == "n" || SentenceTagValue1.tag == "v") {
        SentenceTagList1.push(SentenceTagValue1);
      }
    });

    //句2作斷詞後只取 n v
    synonyms.tag(SearchSentenceResultList[3]).map(SentenceTagValue2 => {
      if (SentenceTagValue2.tag == "n" || SentenceTagValue2.tag == "v") {
        SentenceTagList2.push(SentenceTagValue2);
      }
    });

    // console.log("句1剩餘詞=", SentenceTagList1, "\n句2剩餘詞=", SentenceTagList2);

    SentenceTagList1.map(SentenceValue1 => {
      SentenceTagList2.map(SentenceValue2 => {
        // synonyms.compare(sify(SentenceValue1.word), sify(SentenceValue2.word)).then(similarity => {
        //   //  console.log(SentenceValue1.word, SentenceValue2.word, similarity.toFixed(3));
        // });
      });
    });
  });
};

searchSimilarSentences("裝置傳輸線應用程式出現的視窗是幾點");
