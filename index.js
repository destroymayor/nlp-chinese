import nodejieba from "nodejieba";

// file process
import fs from "fs";
import JFile from "jfile";
import xlsx from "node-xlsx";

import StateMachine from "fsm-as-promised";

import {
  similarity,
  getMeanAndVar
} from "./src/Calculation";

// 載入字典
nodejieba.load({
  userDict: "./jieba/dict.txt"
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

  const NList = [];
  const VList = [];
  const outputN = [];
  const outputV = [];
  await fs.readFile("./file/ExtendedQuestion.json", "utf-8", (err, data) => {
    if (err) console.log(data);
    const List = JSON.parse(data);
    List.map((value, index) => {
      const jieba = nodejieba.tag(value);

      // // N
      // for (let i = 0; i < jieba.length - 2; i++) {
      //   if (jieba[i].tag == "n" && jieba[i + 1].tag == "n" && jieba[i + 2].tag == "n") {
      //     outputN.push(jieba[i].word + jieba[i + 1].word + jieba[i + 2].word);
      //     fs.writeFile("./file/ConcatExtendedQuestion/NList.json", JSON.stringify(outputN), err => {
      //       if (err) console.log(err);
      //     });
      //   }
      // }

      // // V
      // for (let i = 0; i < jieba.length - 2; i++) {
      //   if (jieba[i].tag == "v" && jieba[i + 1].tag == "v" && jieba[i + 2].tag == "v") {
      //     outputV.push(jieba[i].word + jieba[i + 1].word + jieba[i + 2].word);
      //     fs.writeFile("./file/ConcatExtendedQuestion/VList.json", JSON.stringify(outputV), err => {
      //       if (err) console.log(err);
      //     });
      //   }
      // }
    });

    fs.readFile("./file/ConcatExtendedQuestion/VList.json", "utf-8", (err, data) => {
      const NList = JSON.parse(data);
      const DataNList = [...new Set(NList)];

      DataNList.map((value, index) => {
        fs.appendFile("./file/ConcatExtendedQuestion/VList.txt", value + "\n", err => {
          if (err) console.log(err);
        });
      });
    });
  });
};

ConcatExtendedQuestion();
