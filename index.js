import nodejieba from "nodejieba";

// distance process
import Fastlevenshtein from "fast-levenshtein";
import lcs from "node-lcs";

// file process
import fs from "fs";
import JFile from "jfile";
import xlsx from "node-xlsx";

import StateMachine from "fsm-as-promised";

// 載入字典
nodejieba.load({
  userDict: "./jieba/Jieba_TW.utf8"
});

// 兩個字串相似度
const similarity = async (one, two) => {
  if (!one || !two || !one.length || !two.length) return 0;
  if (one === two) return 1;
  let d = Fastlevenshtein.get(one.toLowerCase(), two.toLowerCase());
  let longest = Math.max(one.length, two.length);
  return (longest - d) / longest;
};

// 平均與變異值
const getMeanAndVar = arr => {
  function getVariance(arr, mean) {
    return arr.reduce((pre, cur) => {
      pre = pre + Math.pow(cur - mean, 2);
      return pre;
    }, 0);
  }

  const meanTot = arr.reduce((pre, cur) => {
    return pre + cur;
  });
  const total = getVariance(arr, meanTot / arr.length);

  const res = {
    mean: meanTot / arr.length,
    variance: total / arr.length
  };

  return ["Mean:", res.mean.toFixed(2), "Variance:", res.variance.toFixed(2)].join(" ");
};

const Mean = [];
const MeanAndVar = async () => {
  const list = [];
  const jfile = new JFile("./QA.txt");
  await jfile.lines.map((value, index) => {
    if (index >= 54 && index <= 78) {
      // console.log(value);
      list.push(value.replace("\r", ""));
    }
  });

  for (let j = 1; j < 24; j++) {
    // console.log(list[i], list[j], Fastlevenshtein.get(list[i], list[j]));
    Mean.push(Fastlevenshtein.get(list[0], list[j]));
  }
};

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
            'name': arr[index + 1].tag.replace("\r", ""),
            'from': arr[index].word,
            'to': arr[index + 1].word
          });

          const fsmDataList = {
            initial: arr[0].word,
            events: StateList
          }

          fs.writeFile("./fsm/fsmData.json", JSON.stringify(fsmDataList), "utf-8");
        }
      });
    })
  });
};

// const data = [].concat(...list);
// const result = [...new Set(data.map(item => JSON.stringify(item)))].map(item => JSON.parse(item));
// await fs.writeFile("./list10.json", JSON.stringify(result), "utf-8");

CreateFsmData();
