import nodejieba from "nodejieba";

// user Dict 需要先cut在tag
nodejieba.load({
  dict: "./jieba/dict.txt",
  userDict: "./jieba/userdict.utf8"
});

// file process
import fs from "fs";

//繁轉簡  tify=轉成正體中文
import {
  tify,
  sify
} from "chinese-conv";

import {
  replaceCumulative,
  removeDuplicates,
  DeduplicationMergedObject2
} from "./src/ArrayProcess";
import {
  levenshteinDistance,
  similarity
} from "./src/Calculation";

import {
  DictionaryIntegration
} from "./src/dictionaryIntegration/DictionaryIntegration";

//import synonyms from "node-synonyms";

//replace all Noun or Verb
const CombinationReplaceAll = () => {
  fs.readFile("./file/Black/Black_CombinationAppearsSentence.json", "utf-8", (BlackSentenceError, BlackSentenceData) => {
    if (BlackSentenceError) throw BlackSentenceError;
    const BlackSentenceList = JSON.parse(BlackSentenceData);
    fs.readFile(
      "./file/Samsung/Samsung_CombinationAppearsSentence.json",
      "utf-8",
      (SamsungSentenceError, SamsungSentenceData) => {
        if (SamsungSentenceError) throw SamsungSentenceError;
        const SamsungSentenceList = JSON.parse(SamsungSentenceData).map(item => item);

        //Samsung sentence 斷詞取 Noun
        const SamsungSentenceNoun = SamsungSentenceList.map(item => {
          const total = [];
          nodejieba.cut(item.Sentence).map(CutValue => {
            nodejieba.tag(CutValue).map(value => {
              if (value.tag === "n") total.push(value.word);
            });
          });
          const result = [...new Set(total)];
          return result;
        });

        //Samsung sentence 斷詞取 Verb
        const SamsungSentenceVerb = SamsungSentenceList.map(item => {
          const total = [];
          nodejieba.cut(item.Sentence).map(CutValue => {
            nodejieba.tag(CutValue).map(value => {
              if (value.tag === "v") total.push(value.word);
            });
          });
          const result = [...new Set(total)];
          return result;
        });

        // iteration all sentence
        BlackSentenceList.map(BlackValue => {
          const BlackSentence = BlackValue.Sentence;

          //Noun and Verb list
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

          //replace  | total index=3026
          const i = 100;
          // 只替換兩個陣列長度一樣的
          //for (let i = 0; i < 3026; i++) {
          if (
            BlackSentenceListTagArrayNoun.length === SamsungSentenceNoun[i].length &&
            BlackSentenceListTagArrayVerb.length === SamsungSentenceVerb[i].length
          ) {
            //replace Noun
            const replaceNoun = replaceCumulative(BlackSentence, BlackSentenceListTagArrayNoun, SamsungSentenceNoun[i], "n");
            //replace Verb
            const replaceVerb = replaceCumulative(replaceNoun, BlackSentenceListTagArrayVerb, SamsungSentenceVerb[i], "v");

            console.log(
              "BlackCat n=",
              BlackSentenceListTagArrayNoun.toString(),
              " v=",
              BlackSentenceListTagArrayVerb.toString(),
              "\nSamsung  n=",
              SamsungSentenceNoun[i].toString(),
              " v=",
              SamsungSentenceVerb[i].toString(),
              "\n替換後句子=",
              replaceVerb,
              "\n"
            );

            // fs.appendFile(
            //   "./file/output/replaceSentence.txt",
            //   "\nBlackCat n=" +
            //     BlackSentenceListTagArrayNoun.toString() +
            //     " v=" +
            //     BlackSentenceListTagArrayVerb.toString() +
            //     "\nSamsung  n=" +
            //     SamsungSentenceNoun[i].toString() +
            //     " v=" +
            //     SamsungSentenceVerb[i].toString() +
            //     "\n黑貓原句子=" +
            //     BlackValue.Sentence +
            //     "\n替換後句子=" +
            //     replaceVerb +
            //     "\n",
            //   err => {
            //     if (err) throw err;
            //   }
            // );

            // fs.appendFile("./file/output/replaceSentence.txt", "\n" + replaceVerb, err => {
            //   if (err) throw err;
            // });
            // }
          }
        });
      }
    );
  });
};

const DownsizeReplaceSentence = () => {
  //讀txt 寫入json
  // const lineReader = require("readline").createInterface({
  //   input: fs.createReadStream("./file/output/replaceSentence1.txt")
  // });

  // lineReader.on("line", line => {
  //   console.log(line);
  //   fs.appendFile("./file/output/replaceSentenceList.json", '"' + line + '",', err => {
  //     if (err) throw err;
  //   });
  // });

  fs.readFile("./file/output/replaceSentenceList.json", "utf-8", (err, data) => {
    if (err) throw err;
    const reduceArray = [...new Set(JSON.parse(data))];
    const filterArray = reduceArray.sort((after, before) => {
      return after.length - before.length;
    });

    filterArray.map(item => {
      fs.appendFile("./file/output/replaceSentenceList.txt", item + "\n", error => {
        if (error) throw error;
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
          if (similarity(SearchSentenceListArr[SearchSentenceIndex], SentenceValueArr[SentenceIndex]) >= 0.95) {
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

//DownsizeReplaceSentence();

SearchSimilarSentences();

//CalculationWordDistance();
