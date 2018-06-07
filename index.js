import nodejieba from "nodejieba";

// file process
import fs from "fs";

// 距離計算
import lcs from "longest-common-subsequence";
import levenshtein from "fast-levenshtein";

//繁轉簡
import { tify, sify } from "chinese-conv";

import { replaceBulk, replaceCumulative, removeDuplicates } from "./src/arrayProcess";

//同義詞
//import synonyms from "node-synonyms";

// 載入字典
nodejieba.load({
  dict: "./jieba/dict.txt"
});

const CreateFsmData = async () => {
  const DataList = [];
  const StateList = [];
  await fs.readFile("./file/QA1.json", "utf-8", (err, data) => {
    const List = JSON.parse(data);
    List[Object.keys(List)].forEach(element => {
      DataList.push(nodejieba.tag(element));
    });
    DataList.map((element, index) => {
      DataList[index].map((value, index, array) => {
        const arr = array.map(item => item);
        if (array.indexOf(value) >= 0 && array.indexOf(value) < array.length - 1) {
          StateList.push({
            name: arr[index + 1].tag.replace("\r", ""),
            from: arr[index].word,
            to: arr[index + 1].word
          });

          const fsmDataList = {
            initial: arr[0].word,
            events: StateList
          };

          fs.writeFile("./fsm/fsmData.json", JSON.stringify(fsmDataList), "utf-8", err => {
            if (err) console.log(err);
          });
        }
      });
    });
  });
};

const ConcatExtendedQuestion = async () => {
  // const DataList = [];
  // await fs.readFile('./file/QA.json', 'utf-8', (err, data) => {
  //   const List = JSON.parse(data);
  //   Object.keys(List).map((value, index) => {
  //     DataList.push(List[value]);
  //   });
  //   fs.writeFile('./file/ExtendedQuestion.json', JSON.stringify([].concat(...DataList)), 'utf-8', (err) => {
  //     if (err) console.log(err)
  //   })
  // });

  const outputN = [];
  const outputV = [];
  await fs.readFile("./file/ExtendedQuestion.json", "utf-8", (err, data) => {
    if (err) console.log(data);
    const List = JSON.parse(data);
    List.map((value, index) => {
      const jieba = nodejieba.tag(value);
      // N
      // for (let i = 0; i < jieba.length - 1; i++) {
      //   if (jieba[i].tag == "n" && jieba[i + 1].tag == "n") {
      //     outputN.push(jieba[i].word + jieba[i + 1].word);

      //     fs.writeFile("./file/ConcatExtendedQuestion/NList.json", JSON.stringify(outputN), err => {
      //       if (err) console.log(err);
      //     });
      //   }
      // }

      // //V
      // for (let i = 0; i < jieba.length - 1; i++) {
      //   if (jieba[i].tag == "v" && jieba[i + 1].tag == "v") {
      //     outputV.push({
      //       Question: value,
      //       Value: jieba[i].word + jieba[i + 1].word
      //     });

      //     fs.writeFile("./file/ConcatExtendedQuestion/VList.json", JSON.stringify(outputV), err => {
      //       if (err) console.log(err);
      //     });
      //   }
      // }
    });

    // fs.readFile("./file/ConcatExtendedQuestion/NList.json", "utf-8", (err, data) => {
    //   const List = JSON.parse(data);
    //   const output = List.filter((item, index, self) => index === self.findIndex(t => t === item));
    //   console.log(output);
    //   output.map((value, index) => {
    //     fs.appendFile("./file/ConcatExtendedQuestion/NList.txt", value + "  =>  " + value + "\n", err => {
    //       if (err) console.log(err);
    //     });
    //   });
    // });
  });
};

const SpokenWords = async () => {
  fs.readFile("./file/QA.json", "utf-8", (err, data) => {
    if (err) throw err;

    const List = JSON.parse(data);

    console.log(Object.keys(List)[7]);
    const l = List[Object.keys(List)[7]];
    const levenshteinList = [];

    // levenshtein 取推導長度小於10的問句
    for (let i = 0; i < l.length - 1; i++) {
      if (levenshtein.get(l[i], l[i + 1]) <= 10) {
        levenshteinList.push(l[i]);
      }
    }

    const nounList = [];
    // 將levenshtein 推導長度小於10的問句分詞性，取名詞
    levenshteinList.map(item => {
      nodejieba.tag(item).map((value, index) => {
        if (value.tag === "n" && value.word.length > 1) {
          nounList.push(value.word);
        }
      });
    });

    // levenshtein推導長度小於10問句裡的名詞取代掉
    levenshteinList.map(value => {
      console.log(value);
      console.log(value.replace(new RegExp([...new Set(nounList)].join("|"), "g"), "【】"));
      console.log("----------");
    });
  });
};

const SynonymsDict = async text => {
  const list = [];
  synonyms.nearby(sify(text)).then(result => {
    const synonyms = result[1].map(item => item);
    const word = result[0].map((item, index) => {
      list.push({
        word: tify(item),
        synonym: synonyms[index]
      });
    });
    console.log("同義詞");
    console.log(list);
    console.log("============================");
  });
};

//統計名詞動詞出現次數
const StatisticsMenuVerbsAndNouns = async () => {
  fs.readFile("./file/ExtendedQuestion.json", "utf-8", (err, data) => {
    if (err) throw err;
    const DataList = JSON.parse(data);

    const resultV = [];
    const resultN = [];
    //  DataList.map(item => {
    synonyms.tag(DataList[10]).map((value, index, array) => {
      const arr = array.map(item => item);
      if (value.tag == "n" || value.tag == "v") {
        //resultV.push({ key1: tify(arr[index].word), key2: tify(arr[index + 1].word) });
      }
    });
    //  });
    // DataList.map(item => {
    //   synonyms.tag(sify(item)).map(value => {
    //     if (value.tag == "v") {
    //       resultV.push(tify(value.word));
    //     }
    //   });
    // });

    // const result = {};
    // for (let i = 0; i < resultV.length; ++i) {
    //   if (!result[resultV[i]]) result[resultV[i]] = 0;
    //   ++result[resultV[i]];
    // }

    // const res = Object.entries(result);
    // let sorted = res.sort((a, b) => b[1] - a[1]);

    // fs.writeFile("./file/resultV.json", JSON.stringify(sorted), err => {
    //   if (err) throw err;
    // });
  });
};

//統計名詞動詞出現次數
const SamsungStatisticsMenuVerbsAndNouns = async () => {
  fs.readFile("./file/SAMSUNG_Manual_Clean.txt", "utf-8", (err, data) => {
    if (err) throw err;

    const resultV = [];
    const resultN = [];
    synonyms.tag(sify(data)).map(value => {
      if (value.tag == "n") {
        resultN.push(tify(value.word));
      }
    });

    const result = {};
    for (var i = 0; i < resultN.length; ++i) {
      if (!result[resultN[i]]) result[resultN[i]] = 0;
      ++result[resultN[i]];
    }
    const res = Object.entries(result);
    let sorted = res.sort((a, b) => b[1] - a[1]);

    fs.writeFile("./file/SAMSUNG_key_N.json", JSON.stringify(sorted), err => {
      if (err) throw err;
    });
  });
};

const IncludesToKey = async () => {
  const DataListN = [];
  const DataListV = [];
  // fs.readFile("./file/blackCat_key_N.json", "utf-8", (err, Ndata) => {
  //   const Nlist = JSON.parse(Ndata);
  //   fs.readFile("./file/blackCat_key_V.json", "utf-8", (error, Vdata) => {
  //     const Vlist = JSON.parse(Vdata);

  //     //名詞
  //     [].concat(...Nlist).map((item, index) => {
  //       if (typeof item === "string") {
  //         if (index <= 100) {
  //           DataListN.push(item);
  //         }
  //       }
  //     });

  //     //動詞
  //     [].concat(...Vlist).map((item, index) => {
  //       if (typeof item === "string") {
  //         if (index <= 100) {
  //           DataListV.push(item);
  //         }
  //       }
  //     });

  //     const keyList = [];
  //     for (let i = 0; i < 10; i++) {
  //       for (let j = 0; j < 10 - 1; j++) {
  //         keyList.push({ key1: DataListN[i], key2: DataListV[j + 1] });
  //       }
  //     }
  //     fs.writeFile("./file/B_keyTwo_NandV.json", JSON.stringify(keyList));
  //   });
  // });

  ////////////////
  //三星讀句子
  const total = [];
  // const lineReader = require("readline").createInterface({
  //   input: fs.createReadStream("./file/SAMSUNG_Manual_Clean.txt")
  // });

  // fs.readFile("./file/B_keyTwo_NandV.json", "utf-8", (err, keyData) => {
  //   const list = JSON.parse(keyData);
  //   list.map((value, index, array) => {
  //     const arr = array.map(item => item);
  //     console.log(arr[index].key1, arr[index].key2);
  //     lineReader.on("line", line => {
  //       if (line.includes(arr[index].key1) && line.includes(arr[index].key2)) {
  //         total.push({ key1: arr[index].key1, key2: arr[index].key2, content: line });
  //         fs.writeFile("./file/totalTwo_NandV.json", JSON.stringify(total), err => {
  //           if (err) throw err;
  //         });
  //       }
  //     });
  //   });
  // });

  //////過濾
  // fs.readFile("./file/totalTwo_NandV.json", "utf-8", (err, data) => {
  //   const list = JSON.parse(data);
  //   fs.writeFile("./file/totalTwo_NandV.json", JSON.stringify(removeDuplicates(list, "content")), err => {
  //     if (err) throw err;
  //   });
  // });
};

const Samsung_ChangeNV = () => {
  fs.readFile("./file/B_keyTwo_NandV.json", "utf-8", (errors, BKeyData) => {
    const BKeyDataList = JSON.parse(BKeyData);

    fs.readFile("./file/totalTwo_NandV.json", "utf-8", (err, data) => {
      const list = JSON.parse(data);
      fs.readFile("./file/S_keyTwo_NandV.json", "utf-8", (error, KeyData) => {
        const i = 0;
        const j = 0;
        const SKeyDataList = JSON.parse(KeyData);
        const SKeyword1 = SKeyDataList[i].key1;
        const SKeyword2 = SKeyDataList[j].key2;
        const BKeyword1 = BKeyDataList[i].key1;
        const BKeyword2 = BKeyDataList[j].key2;

        list.map(value => {
          if (value.content.match(new RegExp(".*" + SKeyword1 + ".*" + SKeyword2))) {
            console.log(
              SKeyword1,
              SKeyword2,
              replaceBulk(value.content, [SKeyword1, SKeyword2], ["【" + BKeyword1 + "】", "【" + BKeyword2 + "】"]) + "\n"
            );
            fs.appendFile(
              "./file/B_change_NandV1.txt",
              "Samsung N=" +
                SKeyword1 +
                ", V=" +
                SKeyword2 +
                " | black N=" +
                BKeyword1 +
                ", V=" +
                BKeyword2 +
                "  => " +
                replaceBulk(value.content, [SKeyword1, SKeyword2], ["【" + BKeyword1 + "】", "【" + BKeyword2 + "】"]) +
                "\n",
              err => {
                if (err) throw err;
              }
            );
          }
        });
      });
    });
  });
};

const BlackCatCombinationReplaceOnce = async () => {
  fs.readFile("./file/Black/Black_VandV.json", "utf-8", (err, BlackKeyData) => {
    const BKeyList = JSON.parse(BlackKeyData);
    fs.readFile("./file/Samsung/Samsung_VandV.json", "utf-8", (error, SKeyKeyData) => {
      const SKeyList = JSON.parse(SKeyKeyData);
      fs.readFile("./file/ExtendedQuestion.json", "utf-8", (e, data) => {
        const list = JSON.parse(data);
        const i = 9;
        const BKeyword1 = BKeyList[i].key1;
        const BKeyword2 = BKeyList[i].key2;
        const SKeyword1 = SKeyList[i].key1;
        const SKeyword2 = SKeyList[i].key2;
        list.map(value => {
          if (value.match(BKeyword1) && value.includes(BKeyword2)) {
            console.log(
              "B " +
                BKeyword1 +
                "," +
                BKeyword2 +
                ",S " +
                SKeyword1 +
                "," +
                SKeyword2 +
                " =>" +
                replaceBulk(value, [BKeyword1, BKeyword2], ["【" + SKeyword1 + "】", "【" + SKeyword2 + "】"]) +
                "\n"
            );

            fs.appendFile(
              "./file/output/B_change_VandV.txt",
              "black V=" +
                BKeyword1 +
                ", V=" +
                BKeyword2 +
                " | Samsung V=" +
                SKeyword1 +
                ", V=" +
                SKeyword2 +
                " => " +
                replaceBulk(value, [BKeyword1, BKeyword2], ["【" + SKeyword1 + "】", "【" + SKeyword2 + "】"]) +
                "\n",
              err => {
                if (err) throw err;
              }
            );
          }
        });
      });
    });
  });
};

const BlackCatCombinationReplace = async () => {
  fs.readFile("./file/ExtendedQuestion.json", "utf-8", (err, BlackCatData) => {
    const BlackCatList = JSON.parse(BlackCatData);
    fs.readFile("./file/Black/Black_NandV.json", "utf-8", (err, BlackKeyword) => {
      const BlackKeywordList = JSON.parse(BlackKeyword);
      fs.readFile("./file/Samsung/Samsung_NandV.json", "utf-8", (e, SamsungKeyword) => {
        const SamsungKeywordList = JSON.parse(SamsungKeyword);

        const i = 4;
        const j = 0;
        const BKeyword1 = BlackKeywordList[i].key1[0];
        const BKeyword2 = BlackKeywordList[i].key2[0];
        const SKeyword1 = SamsungKeywordList[i].key1[0];
        const SKeyword2 = SamsungKeywordList[i].key2[0];
        BlackCatList.map(value => {
          if (value.match(new RegExp(BKeyword1 + ".*?" + BKeyword2))) {
            const NN_Once_Output = replaceCumulative(
              value,
              [BKeyword1, BKeyword2],
              ["【" + SKeyword1 + "】", "【" + SKeyword2 + "】"]
            );

            const NN_Once = replaceCumulative(value, [BKeyword1, BKeyword2], [SKeyword1, SKeyword2]);
            nodejieba.tag(NN_Once).map((CutValue, index, array) => {
              const arr = array.map(item => item);
              //找出詞性
              if (CutValue.tag == "n") {
                //過濾字串
                console.log(CutValue);
                if (NN_Once.match(new RegExp(SKeyword1 + ".*?" + SKeyword2 + ".*?" + arr[index].word)))
                  // fs.appendFile(
                  //   "./file/output/Black_NV.txt",
                  //   "\n black=" +
                  //     BKeyword1 +
                  //     "," +
                  //     BKeyword2 +
                  //     " , Samsung=" +
                  //     SKeyword1 +
                  //     "," +
                  //     SKeyword2 +
                  //     "," +
                  //     arr[index].word +
                  //     "\n nv => " +
                  //     NN_Once_Output +
                  //     " | nvn => " +
                  //     replaceCumulative(NN_Once_Output, [arr[index].word], ["(" + SamsungKeywordList[j].key1[0] + ")"]),
                  //   err => {
                  //     if (err) throw err;
                  //   }
                  // );
                  console.log(
                    "\n black=",
                    BKeyword1,
                    BKeyword2,
                    ", samsung = ",
                    SKeyword1,
                    SKeyword2,
                    arr[index].word,
                    "\n",
                    NN_Once_Output,
                    "\n",
                    replaceCumulative(NN_Once_Output, [arr[index].word], ["(" + SamsungKeywordList[j].key1[0] + ")"])
                  );
              }
            });
          }
        });
      });
    });
  });
};

BlackCatCombinationReplace();
