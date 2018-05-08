// distance process
import Fastlevenshtein from "fast-levenshtein";
import lcs from "node-lcs";

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

export {
    similarity,
    getMeanAndVar
}
