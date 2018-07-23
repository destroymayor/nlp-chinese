import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt",
  userDict: "./jieba/userdict.utf8"
});

import fs from "fs";

import {
  tify, //tify=轉成正體中文
  sify
} from "chinese-conv";

import {
  replaceCumulative,
  removeDuplicates,
  DeduplicationMergedObject2
} from "./src/ArrayProcess";

import {
  similarity
} from "./src/Calculation";

import {
  DictionaryIntegration
} from "./src/dictionaryIntegration/DictionaryIntegration";

// import synonyms from "node-synonyms";

const KeywordCombinationReplaceAll = () => {
  fs.readFile("./file/Black/BlackCat_ExtendedQuestion.json", "utf-8", (BlackSentenceError, BlackSentenceData) => {
    const BlackSentenceList = JSON.parse(BlackSentenceData);
    fs.readFile("./file/Samsung/Samsung_LocalCombination.json", "utf-8", (SamsungSentenceError, SamsungSentenceData) => {
      const SamsungSentenceList = JSON.parse(SamsungSentenceData);

      // iteration all sentence
      BlackSentenceList.map(BlackSentence => {
        //BlackCat Noun and Verb list
        const BlackSentenceListTagArrayNoun = [];
        const BlackSentenceListTagArrayVerb = [];

        nodejieba.cut(BlackSentence).map(CutValue => {
          nodejieba.tag(CutValue).map(BlackSentenceListTagValue => {
            //Noun and word length > 1
            if (BlackSentenceListTagValue.tag === "n" && BlackSentenceListTagValue.word.length > 1) {
              BlackSentenceListTagArrayNoun.push(BlackSentenceListTagValue.word);
            }
            //Verb and word length > 1
            if (BlackSentenceListTagValue.tag === "v" && BlackSentenceListTagValue.word.length > 1) {
              BlackSentenceListTagArrayVerb.push(BlackSentenceListTagValue.word);
            }
          });
        });

        Object.keys(SamsungSentenceList).map(item => {
          if (SamsungSentenceList[item].length > 0) {
            SamsungSentenceList[item].map(value => {
              //判斷組合詞是否大於1
              if (value.n !== undefined && value.v !== undefined) {
                // 判斷black 與samsung 組合詞長度是否一樣
                if (BlackSentenceListTagArrayNoun.length === value.n.length && BlackSentenceListTagArrayVerb.length === value.v.length) {
                  //先替換名詞 且在特定詞頻內
                  if (value.count >= 10 && value.n) {
                    const replaceSentenceNoun = replaceCumulative(BlackSentence, BlackSentenceListTagArrayNoun, [value.n], "n");
                    if (value.v) {
                      const replaceSentenceVerb = replaceCumulative(replaceSentenceNoun, BlackSentenceListTagArrayVerb, [value.v], "v");

                      console.log(BlackSentence, value.count, "替換後=>" + replaceSentenceVerb);

                      // fs.appendFileSync(
                      //   "./file/output/replaceSentenceSamsungLocal1.txt",
                      //   "BlackCat原句子=> " + BlackSentence + " | 出現頻率=>" + value.count + " | 替換後=> " + replaceSentenceVerb + "\n",
                      //   err => {
                      //     if (err) throw err;
                      //   }
                      // );
                    }
                  }
                }
              }
            });
          }
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
            fs.appendFileSync(
              "./file/output/SimilaritySentence.txt",
              "相似度=" +
              similarity(SentenceValue, SearchSentenceListValue).toFixed(3) +
              " Samsung句子=> " +
              SearchSentenceListValue +
              " | 相似句=> " +
              SentenceValue +
              "\n",
              err => {
                if (err) throw err;
              }
            );
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

//計算斷詞後剩餘詞在向量裡的距離
const CalculationWordDistance = () => {
  fs.readFile("./file/output/SearchSentence.json", "utf-8", (err, SentenceData) => {
    const SentenceList = removeDuplicates(JSON.parse(SentenceData), "SimilaritySentence");

    const i = 50;
    const Sentence1 = SentenceList[i].SearchSentence;
    const Sentence2 = SentenceList[i].SimilaritySentence;

    //句1作斷詞後只取 n v
    const SentenceTagListOne = [];
    nodejieba.cut(Sentence1).map(CutValue => {
      nodejieba.tag(CutValue).map(SentenceTagValueOne => {
        if (SentenceTagValueOne.tag == "n" || SentenceTagValueOne.tag == "v") {
          SentenceTagListOne.push(SentenceTagValueOne);
        }
      });
    });

    // //句2作斷詞後只取 n v
    const SentenceTagListTwo = [];
    nodejieba.cut(Sentence2).map(CutValue => {
      nodejieba.tag(CutValue).map(SentenceTagValueTwo => {
        if (SentenceTagValueTwo.tag == "n" || SentenceTagValueTwo.tag == "v") {
          SentenceTagListTwo.push(SentenceTagValueTwo);
        }
      });
    });

    SentenceTagListOne.map(SentenceValueOne => {
      SentenceTagListTwo.map(SentenceValueTwo => {
        synonyms.compare(sify(SentenceValueOne.word), sify(SentenceValueTwo.word)).then(similarity => {
          if (SentenceValueOne.word !== SentenceValueTwo.word && similarity.toFixed(3) >= 0.5) {
            console.log(
              "\n句一=>",
              Sentence1,
              "\n句二=>",
              Sentence2,
              "\nkeyword相似度=>",
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

//CombinationReplaceAll();

KeywordCombinationReplaceAll();

//SearchSimilarSentences();

//CalculationWordDistance();
