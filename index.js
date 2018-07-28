import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt",
  userDict: "./jieba/userdict.utf8"
});

import fs from "fs";

const replaceCumulative = (str, find, replace) => {
  for (let i = 0; i < find.length; i++) str = str.replace(new RegExp(find[i]), replace[i]);
  return str;
};

const KeywordCombinationReplaceAll = () => {
  fs.readFile("./file/Black/Black_Test.json", "utf-8", (BlackSentenceError, BlackSentenceData) => {
    const BlackSentenceList = JSON.parse(BlackSentenceData);
    fs.readFile("./file/Samsung/Samsung_Test.json", "utf-8", (SamsungSentenceError, SamsungSentenceData) => {
      const SamsungSentenceList = JSON.parse(SamsungSentenceData);

      // 迭代黑貓句子
      BlackSentenceList.map(BlackSentence => {
        // BlackCat Noun and Verb list
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
          SamsungSentenceList[item].filter(value => {
            //判斷組合詞是否大於1 && black 與samsung 組合詞長度是否一樣
            if (
              value.n &&
              value.v !== undefined &&
              BlackSentenceListTagArrayNoun.length === value.n.length &&
              BlackSentenceListTagArrayVerb.length === value.v.length
            ) {
              //先替換名詞
              const replaceSentenceNoun = replaceCumulative(BlackSentence, BlackSentenceListTagArrayNoun, value.n);
              const replaceSentenceVerb = replaceCumulative(replaceSentenceNoun, BlackSentenceListTagArrayVerb, value.v);
              console.log(BlackSentence, "替換後=>" + replaceSentenceVerb);
            }
          });
        });
      });
    });
  });
};

KeywordCombinationReplaceAll();
