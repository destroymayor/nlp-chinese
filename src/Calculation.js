import nodejieba from "nodejieba";

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

//levenshtein 距離
const levenshteinDistance = (firstString, secondString) => {
  // const OneList = [];
  // const OneListOther = [];
  // nodejieba.cut(one).map(CutValue => {
  //   nodejieba.tag(CutValue).map(value => {
  //     if (value.tag === "n") {
  //       OneList.push((value.word = "1"));
  //     } else {
  //       OneListOther.push(value.word.toString());
  //     }
  //   });
  // });

  // const TwoList = [];
  // const TwoListOther = [];
  // nodejieba.cut(two).map(CutValue => {
  //   nodejieba.tag(CutValue).map(value => {
  //     if (value.tag === "n") {
  //       TwoList.push((value.word = "1"));
  //     } else {
  //       TwoListOther.push(value.word.toString());
  //     }
  //   });
  // });

  // let firstString = OneList.reduce((a, b) => a + b, 0) + OneListOther.reduce((a, b) => a + b, 0);
  // let secondString = TwoList.reduce((a, b) => a + b, 0) + TwoListOther.reduce((a, b) => a + b, 0);

  const distanceMatrix = Array(secondString.length + 1)
    .fill(null)
    .map(() => Array(firstString.length + 1).fill(null));

  for (let i = 0; i <= firstString.length; i += 1) {
    distanceMatrix[0][i] = i;
  }

  for (let j = 0; j <= secondString.length; j += 1) {
    distanceMatrix[j][0] = j;
  }

  for (let j = 1; j <= secondString.length; j += 1) {
    for (let i = 1; i <= firstString.length; i += 1) {
      const indicator = firstString[i - 1] === secondString[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(
        distanceMatrix[j][i - 1] + 1, //刪除
        distanceMatrix[j - 1][i] + 1, //插入
        distanceMatrix[j - 1][i - 1] + indicator //替換
      );
    }
  }
  return distanceMatrix[secondString.length][firstString.length];
};

// 兩個字串相似度 levenshtein
const similarity = (one, two) => {
  if (!one || !two || !one.length || !two.length) return 0;
  if (one === two) return 1;
  // levenshtein 編輯距離長度
  let d = levenshteinDistance(one, two);
  // 兩個字串取最大值
  let longest = Math.max(one.length, two.length);
  return (longest - d) / longest;
};

const lcsLength = (s1, s2) => {
  const s1_length = s1.length;
  const s2_length = s2.length;
  const x = s1.split("");
  const y = s2.split("");
  const c = Array(s1_length + 1).fill(Array(s2_length + 1).fill(0));

  for (let i = 1; i <= s1_length; i++) {
    for (let j = 1; j <= s2_length; j++) {
      c[i][j] = x[i - 1] === y[j - 1] ? c[i - 1][j - 1] + 1 : Math.max(c[i][j - 1], c[i - 1][j]);
    }
  }
  return c[s1_length][s2_length];
};

// 兩個字串相似度 Longest Common Subsequence
const metricLcs = (s1, s2) => {
  if (typeof s1 !== "string" || typeof s1 !== "string") return NaN;
  if (s1 === s2) return 1;

  const mlen = Math.max(s1.length, s2.length);
  if (mlen === 0) return 1;
  return lcsLength(s1, s2) / mlen;
};

const longestCommonSubsequence = (set1, set2) => {
  // Init LCS matrix.
  const lcsMatrix = Array(set2.length + 1)
    .fill(null)
    .map(() => Array(set1.length + 1).fill(null));

  // Fill first row with zeros.
  for (let columnIndex = 0; columnIndex <= set1.length; columnIndex += 1) {
    lcsMatrix[0][columnIndex] = 0;
  }

  // Fill first column with zeros.
  for (let rowIndex = 0; rowIndex <= set2.length; rowIndex += 1) {
    lcsMatrix[rowIndex][0] = 0;
  }

  // Fill rest of the column that correspond to each of two strings.
  for (let rowIndex = 1; rowIndex <= set2.length; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex <= set1.length; columnIndex += 1) {
      if (set1[columnIndex - 1] === set2[rowIndex - 1]) {
        lcsMatrix[rowIndex][columnIndex] = lcsMatrix[rowIndex - 1][columnIndex - 1] + 1;
      } else {
        lcsMatrix[rowIndex][columnIndex] = Math.max(lcsMatrix[rowIndex - 1][columnIndex], lcsMatrix[rowIndex][columnIndex - 1]);
      }
    }
  }

  // Calculate LCS based on LCS matrix.
  if (!lcsMatrix[set2.length][set1.length]) {
    // If the length of largest common string is zero then return empty string.
    return [""];
  }

  const longestSequence = [];
  let columnIndex = set1.length;
  let rowIndex = set2.length;

  while (columnIndex > 0 || rowIndex > 0) {
    if (set1[columnIndex - 1] === set2[rowIndex - 1]) {
      // Move by diagonal left-top.
      longestSequence.unshift(set1[columnIndex - 1]);
      columnIndex -= 1;
      rowIndex -= 1;
    } else if (lcsMatrix[rowIndex][columnIndex] === lcsMatrix[rowIndex][columnIndex - 1]) {
      // Move left.
      columnIndex -= 1;
    } else {
      // Move up.
      rowIndex -= 1;
    }
  }

  return longestSequence;
};

export { similarity, lcsLength, metricLcs, longestCommonSubsequence, getMeanAndVar, levenshteinDistance };
