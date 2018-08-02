import { similarity } from "./src/Calculation";

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
  fs.readFile("./file/blackCat_key_N.json", "utf-8", (err, Ndata) => {
    const Nlist = JSON.parse(Ndata);
    fs.readFile("./file/blackCat_key_V.json", "utf-8", (error, Vdata) => {
      const Vlist = JSON.parse(Vdata);

      //名詞
      [].concat(...Nlist).map((item, index) => {
        if (typeof item === "string") {
          if (index <= 100) {
            DataListN.push(item);
          }
        }
      });

      //動詞
      [].concat(...Vlist).map((item, index) => {
        if (typeof item === "string") {
          if (index <= 100) {
            DataListV.push(item);
          }
        }
      });

      const keyList = [];
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10 - 1; j++) {
          keyList.push({
            key1: DataListN[i],
            key2: DataListV[j + 1]
          });
        }
      }
      fs.writeFile("./file/B_keyTwo_NandV.json", JSON.stringify(keyList));
    });
  });

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

const BlackCatCombinationReplace = async () => {
  fs.readFile("./file/ExtendedQuestion.json", "utf-8", (err, BlackCatData) => {
    const BlackCatList = JSON.parse(BlackCatData);
    fs.readFile("./file/Black/Black_NandN.json", "utf-8", (err, BlackKeyword) => {
      const BlackKeywordList = JSON.parse(BlackKeyword);
      fs.readFile("./file/Samsung/Samsung_NandN.json", "utf-8", (e, SamsungKeyword) => {
        const SamsungKeywordList = JSON.parse(SamsungKeyword);

        for (let i = 0; i < 9; i++) {
          const j = i + 1;

          // XX組合
          const BKeyword1 = BlackKeywordList.nn[i].key1[0];
          const BKeyword2 = BlackKeywordList.nn[i].key2[0];
          const SKeyword1 = SamsungKeywordList.nn[i].key1[0];
          const SKeyword2 = SamsungKeywordList.nn[i].key2[0];
          // XX {X}組合
          const SKeyword3 = SamsungKeywordList.nn[j].key1[0];

          BlackCatList.map(value => {
            //配對原始句子中出現的keyword組合
            if (value.match(new RegExp(BKeyword1 + ".*?" + BKeyword2))) {
              //第一次替換 output
              const NN_Once_Output = replaceCumulative(
                value,
                [BKeyword1, BKeyword2],
                ["【" + SKeyword1 + "】", "【" + SKeyword2 + "】"]
              );
              const NN_Once = replaceCumulative(value, [BKeyword1, BKeyword2], [SKeyword1, SKeyword2]);
              //針對第一次替換後的句子做斷詞

              nodejieba.tag(NN_Once).map((CutValue, index, array) => {
                const arr = array.map(item => item);
                //   //只取特定詞性
                if (CutValue.tag == "n") {
                  //     //只取第一次替換後句子中的組合
                  if (NN_Once.match(new RegExp(SKeyword1 + ".*?" + SKeyword2 + ".*?" + arr[index].word))) {
                    // fs.appendFile(
                    //   "./file/output/Black_NNN.txt",
                    //   "\n black=" +
                    //     BKeyword1 +
                    //     "," +
                    //     BKeyword2 +
                    //     "," +
                    //     arr[index].word +
                    //     " , Samsung=" +
                    //     SKeyword1 +
                    //     "," +
                    //     SKeyword2 +
                    //     "," +
                    //     SKeyword3 +
                    //     "\n nnn => " +
                    //     replaceCumulative(NN_Once_Output, [arr[index].word], ["(" + SKeyword3 + ")"]) +
                    //     "\n",
                    //   err => {
                    //     if (err) throw err;
                    //   }
                    // );
                    console.log(
                      "\n Black=",
                      BKeyword1,
                      BKeyword2,
                      arr[index].word,
                      ", Samsung = ",
                      SKeyword1,
                      SKeyword2,
                      SKeyword3,
                      "\n",
                      replaceCumulative(NN_Once_Output, [arr[index].word], ["(" + SKeyword3 + ")"])
                    );
                  }
                }
              });
            }
          });
        }
      });
    });
  });
};

const CombinationReplace = () => {
  fs.readFile("./file/Black/Black_CombinationAppearsSentence.json", "utf-8", (err, BlackSentenceData) => {
    const BlackSentenceList = JSON.parse(BlackSentenceData);
    fs.readFile("./file/Samsung/Samsung_CombinationAppearsSentence.json", "utf-8", (err, SamsungSentenceData) => {
      const SamsungSentenceList = JSON.parse(SamsungSentenceData).map(item => item);

      //針對所有black句子作斷詞 /取動詞
      const BlackSentenceListTagVerb = BlackSentenceList.map(item => {
        const total = [];
        nodejieba.tag(item.Sentence).map(value => {
          if (value.tag == "v") {
            total.push(value);
          }
        });
        //過濾重複的詞
        const result = removeDuplicates(total, "word");
        return result;
      });

      const BlackSentenceNoun = BlackSentenceList.map(item => {
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

      //針對所有Samsung句子作斷詞 /取名詞
      const SamsungSentenceListTagNoun = SamsungSentenceList.map(item => {
        const total = [];
        nodejieba.tag(item.Sentence).map(value => {
          if (value.tag == "n") {
            total.push(value);
          }
        });
        //過濾重複的詞
        const result = removeDuplicates(total, "word");
        return result;
      });

      //全部替換
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

      //針對所有Samsung句子作斷詞 /取動詞
      const SamsungSentenceListTagVerb = SamsungSentenceList.map(item => {
        const total = [];
        nodejieba.tag(item.Sentence).map(value => {
          if (value.tag == "v") {
            total.push(value);
          }
        });
        //過濾重複的詞
        const result = removeDuplicates(total, "word");
        return result;
      });

      /**
         * 詞組合 參數
         @param
         @param black 動詞陣列長度 854
         @param Samsung 動名詞陣列長度 3054
         @param Sindex 索引值
         */
      const Btag1 = BlackSentenceListTagVerb[300][0].word;
      const Sindex = 1900;
      const Stag1 = SamsungSentenceListTagNoun[Sindex][0].word;
      const Stag2 = SamsungSentenceListTagNoun[Sindex][1].word;
      const Stag3 = SamsungSentenceListTagVerb[Sindex][2].word;

      // 迭代所有句子
      BlackSentenceList.map((BlackValue, BlackIndex, BlackArray) => {
        //詞組合替換
        if (BlackValue.Sentence.match(new RegExp(BlackValue.key1 + ".*?" + BlackValue.key2))) {
          //第一次替換(兩個keyword)
          const firstCombination_result = replaceCumulative(
            BlackValue.Sentence,
            [BlackValue.key1, BlackValue.key2],
            ["【" + Stag1 + "】", "【" + Stag2 + "】"]
          );
          const firstCombination = replaceCumulative(BlackValue.Sentence, [BlackValue.key1, BlackValue.key2], [Stag1, Stag2]);

          //將第一次替換後的句子進行詞性標註
          nodejieba.tag(firstCombination).map((BlackKeyword, index, array) => {
            const arr = array.map(item => item);

            //只取出特定詞性
            if (BlackKeyword.tag == "v" && BlackKeyword.word.length > 1) {
              if (firstCombination.match(new RegExp(Stag1 + ".*?" + Stag2 + ".*?" + arr[index].word))) {
                // console.log(
                //   "\n black ",
                //   BlackValue.key1,
                //   BlackValue.key2,
                //   arr[index].word,
                //   ", samsung",
                //   Stag1,
                //   Stag2,
                //   Stag3,
                //   "\n",
                //   BlackValue.Sentence,
                //   "\n",
                //   firstCombination_result,
                //   "\n",
                //   replaceCumulative(
                //     BlackValue.Sentence,
                //     [BlackValue.key1, BlackValue.key2, arr[index].word],
                //     ["【" + Stag1 + "】", "【" + Stag2 + "】", "(" + Stag3 + ")"]
                //   )
                // );
                // fs.appendFile(
                //   "./file/output/newBlack_NNV.txt",
                //   "\nblack= " +
                //     BlackValue.key1 +
                //     "," +
                //     BlackValue.key2 +
                //     "," +
                //     arr[index].word +
                //     ", samsung= " +
                //     Stag1 +
                //     "," +
                //     Stag2 +
                //     "," +
                //     Stag3 +
                //     "\n原句子=> " +
                //     BlackValue.Sentence +
                //     "\nnv=> " +
                //     firstCombination_result +
                //     "\nnvn=> " +
                //     replaceCumulative(
                //       BlackValue.Sentence,
                //       [BlackValue.key1, BlackValue.key2, arr[index].word],
                //       ["【" + Stag1 + "】", "【" + Stag2 + "】", "(" + Stag3 + ")"]
                //     ) +
                //     "\n",
                //   err => {
                //     if (err) throw err;
                //   }
                // );
              }
            }
          });
        }
      });
    });
  });
};

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
          // const i = 100;
          // 只替換兩個陣列長度一樣的
          for (let i = 0; i < 3026; i++) {
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

              fs.appendFile("./file/output/AllReplace1.json", '"' + replaceVerb + '",', err => {
                if (err) throw err;
              });
            }
          }
        });
      }
    );
  });
};

//產生句txt整合到json
const DownsizeReplaceSentence = () => {
  //讀txt 寫入json
  const lineReader = require("readline").createInterface({
    input: fs.createReadStream("./file/output/replaceSentenceSamsungLocal.txt")
  });

  lineReader.on("line", line => {
    console.log(line);
    fs.appendFile("./file/output/replaceSentenceList.json", '"' + line + '",', err => {
      if (err) throw err;
    });
  });

  // fs.readFile("./file/output/AllReplace1.json", "utf-8", (err, data) => {
  //   if (err) throw err;
  //   const reduceArray = [...new Set(JSON.parse(data))];
  //   const filterArray = reduceArray.sort((after, before) => {
  //     return after.length - before.length;
  //   });

  //   filterArray.map(item => {
  //     // fs.appendFile("./file/output/replaceSentenceList.txt", item + "\n", error => {
  //     //   if (error) throw error;
  //     // });
  //     // fs.appendFile("./file/output/replaceSentenceList.json", '"' + item + '",', error => {
  //     //   if (error) throw error;
  //     // });
  //   });
  // });
};
