import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt",
  userDict: "./jieba/userdict.utf8"
});

import fs from "fs";
import {
  replaceCumulative,
} from "./src/ArrayProcess";

const KeywordCombinationReplaceAll = () => {
  fs.readFile("./file/Black/BlackCat_ExtendedQuestion.json", "utf-8", (BlackSentenceError, BlackSentenceData) => {
    const BlackSentenceList = JSON.parse(BlackSentenceData);
    fs.readFile("./file/Samsung/Samsung_LocalCombinationThree.json", "utf-8", (SamsungSentenceError, SamsungSentenceData) => {
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
                  if (value.n) {
                    const replaceSentenceNoun = replaceCumulative(BlackSentence, BlackSentenceListTagArrayNoun, value.n, "n");
                    if (value.v) {
                      const replaceSentenceVerb = replaceCumulative(replaceSentenceNoun, BlackSentenceListTagArrayVerb, value.v, "v");

                      console.log(BlackSentence, "替換後=>" + replaceSentenceVerb);
                      fs.appendFileSync(
                        "./file/output/replaceSentenceSamsungLocalthree.txt",
                        "BlackCat原句子=> " + BlackSentence + " | 替換後=> " + replaceSentenceVerb + "\n",
                        err => {
                          if (err) throw err;
                        }
                      );
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

KeywordCombinationReplaceAll();
