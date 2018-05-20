import nodejieba from "nodejieba";

// file process
import fs from "fs";
import rl from "readline-specific";

// 距離計算
import nodelcs from "node-lcs";
import lcs from "longest-common-subsequence";
import levenshtein from "fast-levenshtein";

//繁轉簡
import {
  tify,
  sify
} from "chinese-conv";

import StateMachine from "fsm-as-promised";
//同義詞
import synonyms from "node-synonyms";

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

const ReadLine = async () => {
  const lineReader = require('readline').createInterface({
    input: fs.createReadStream('./dict1.txt')
  });

  lineReader.on('line', function (line) {
    if (line.split(' ')[0].length > 1) {
      fs.appendFile('./dict2.txt', line + '\n', (err) => {
        if (err) throw err;
      })
    }
  });
}

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
    console.log(list);
    console.log("============================");
  });
};

// set(1,2,3)
//2 = 是否保留停用詞, 3 = 是否保留標點符號
// synonyms.seg("請問可否幫助把小米的貨送到營業所我再去拿", false, false).then(words => {
//   words.map(value => {
//     console.log(SynonymsDict(value));
//   });
// });
