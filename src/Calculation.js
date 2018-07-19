import Fastlevenshtein from "fast-levenshtein";

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

//漢明距離
const naiveHammerDistance = (str1, str2) => {
  var dist = 0;
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();

  for (var i = 0; i < str1.length; i++) {
    if (str2[i] && str2[i] !== str1[i]) {
      dist += Math.abs(str1.charCodeAt(i) - str2.charCodeAt(i)) + Math.abs(str2.indexOf(str1[i])) * 2;
    } else if (!str2[i]) {
      dist += dist;
    }
  }
  return dist;
};

//levenshtein 距離
const levenshteinDistance = (a, b) => {
  const distanceMatrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i += 1) {
    distanceMatrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    distanceMatrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      distanceMatrix[j][i] = Math.min(
        distanceMatrix[j][i - 1] + 1,
        distanceMatrix[j - 1][i] + 1,
        distanceMatrix[j - 1][i - 1] + indicator
      );
    }
  }
  return distanceMatrix[b.length][a.length];
};

//最長共同子字串
const longestCommonSubstring = (s1, s2) => {
  const substringMatrix = Array(s2.length + 1)
    .fill(null)
    .map(() => {
      return Array(s1.length + 1).fill(null);
    });

  for (let columnIndex = 0; columnIndex <= s1.length; columnIndex += 1) {
    substringMatrix[0][columnIndex] = 0;
  }

  for (let rowIndex = 0; rowIndex <= s2.length; rowIndex += 1) {
    substringMatrix[rowIndex][0] = 0;
  }

  let longestSubstringLength = 0;
  let longestSubstringColumn = 0;
  let longestSubstringRow = 0;

  for (let rowIndex = 1; rowIndex <= s2.length; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex <= s1.length; columnIndex += 1) {
      if (s1[columnIndex - 1] === s2[rowIndex - 1]) {
        substringMatrix[rowIndex][columnIndex] = substringMatrix[rowIndex - 1][columnIndex - 1] + 1;
      } else {
        substringMatrix[rowIndex][columnIndex] = 0;
      }

      if (substringMatrix[rowIndex][columnIndex] > longestSubstringLength) {
        longestSubstringLength = substringMatrix[rowIndex][columnIndex];
        longestSubstringColumn = columnIndex;
        longestSubstringRow = rowIndex;
      }
    }
  }

  if (longestSubstringLength === 0) {
    return "";
  }

  let longestSubstring = "";

  while (substringMatrix[longestSubstringRow][longestSubstringColumn] > 0) {
    longestSubstring = s1[longestSubstringColumn - 1] + longestSubstring;
    longestSubstringRow -= 1;
    longestSubstringColumn -= 1;
  }

  return longestSubstring;
};

//最長共同子序列
const longestCommonSubsequnce = (set1, set2) => {
  const lcsMatrix = Array(set2.length + 1)
    .fill(null)
    .map(() => Array(set1.length + 1).fill(null));

  for (let columnIndex = 0; columnIndex <= set1.length; columnIndex += 1) {
    lcsMatrix[0][columnIndex] = 0;
  }

  for (let rowIndex = 0; rowIndex <= set2.length; rowIndex += 1) {
    lcsMatrix[rowIndex][0] = 0;
  }

  for (let rowIndex = 1; rowIndex <= set2.length; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex <= set1.length; columnIndex += 1) {
      if (set1[columnIndex - 1] === set2[rowIndex - 1]) {
        lcsMatrix[rowIndex][columnIndex] = lcsMatrix[rowIndex - 1][columnIndex - 1] + 1;
      } else {
        lcsMatrix[rowIndex][columnIndex] = Math.max(lcsMatrix[rowIndex - 1][columnIndex], lcsMatrix[rowIndex][columnIndex - 1]);
      }
    }
  }

  if (!lcsMatrix[set2.length][set1.length]) {
    return [""];
  }

  const longestSequence = [];
  let columnIndex = set1.length;
  let rowIndex = set2.length;

  while (columnIndex > 0 || rowIndex > 0) {
    if (set1[columnIndex - 1] === set2[rowIndex - 1]) {
      longestSequence.unshift(set1[columnIndex - 1]);
      columnIndex -= 1;
      rowIndex -= 1;
    } else if (lcsMatrix[rowIndex][columnIndex] === lcsMatrix[rowIndex][columnIndex - 1]) {
      columnIndex -= 1;
    } else {
      rowIndex -= 1;
    }
  }

  return longestSequence;
};

//最短共同子序列
const shortestCommonSupersequence = (set1, set2) => {
  const lcs = longestCommonSubsequnce(set1, set2);

  if (lcs.length === 1 && lcs[0] === "") {
    return set1.concat(set2);
  }

  let supersequence = [];

  let setIndex1 = 0;
  let setIndex2 = 0;
  let lcsIndex = 0;
  let setOnHold1 = false;
  let setOnHold2 = false;

  while (lcsIndex < lcs.length) {
    if (setIndex1 < set1.length) {
      if (!setOnHold1 && set1[setIndex1] !== lcs[lcsIndex]) {
        supersequence.push(set1[setIndex1]);
        setIndex1 += 1;
      } else {
        setOnHold1 = true;
      }
    }

    if (setIndex2 < set2.length) {
      if (!setOnHold2 && set2[setIndex2] !== lcs[lcsIndex]) {
        supersequence.push(set2[setIndex2]);
        setIndex2 += 1;
      } else {
        setOnHold2 = true;
      }
    }

    if (setOnHold1 && setOnHold2) {
      supersequence.push(lcs[lcsIndex]);
      lcsIndex += 1;
      setIndex1 += 1;
      setIndex2 += 1;
      setOnHold1 = false;
      setOnHold2 = false;
    }
  }

  if (setIndex1 < set1.length) {
    supersequence = supersequence.concat(set1.slice(setIndex1));
  }

  if (setIndex2 < set2.length) {
    supersequence = supersequence.concat(set2.slice(setIndex2));
  }

  return supersequence;
};

// 兩個字串相似度 levenshtein
const similarity = (one, two) => {
  if (!one || !two || !one.length || !two.length) return 0;
  if (one === two) return 1;
  // levenshtein 編輯距離長度
  let d = Fastlevenshtein.get(one, two);
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

export {
  similarity,
  metricLcs,
  getMeanAndVar,
  naiveHammerDistance,
  levenshteinDistance,
  longestCommonSubstring,
  longestCommonSubsequnce,
  shortestCommonSupersequence
};
