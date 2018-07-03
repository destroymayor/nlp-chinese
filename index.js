import nodejieba from "nodejieba";

// 載入字典
nodejieba.load({ dict: "./jieba/dict.txt" });

// file process
import fs from "fs";

//繁轉簡
//tify 轉成正體中文
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
const searchSimilarSentences = () => {
  fs.readFile("./file/output/AllReplace.json", "utf-8", (err, data) => {
    if (err) throw err;
    const SentenceDataList = JSON.parse(data);

    // 欲搜尋的句子
    const SearchSentence = "裝置的傳輸線可以修理嗎";

    //相似句的list
    const SearchSentenceResultList = [];
    //迭代語料庫所有句子
    SentenceDataList.map(SentenceValue => {
      //句子相似度配對
      if (similarity(SearchSentence, SentenceValue) >= 0.5) {
        SearchSentenceResultList.push(SentenceValue);
      }
    });

    synonyms.seg(sify(SearchSentence), false, false).then(SentenceTagValue1 => {
      synonyms.seg(sify(SearchSentenceResultList[20]), false, false).then(SentenceTagValue2 => {
        console.log(SentenceTagValue1, SentenceTagValue2);
        synonyms.compare(sify("電源線"), sify("傳輸線")).then(similarity => {
          console.log(similarity);
        });
      });
    });
  });
};

searchSimilarSentences();
