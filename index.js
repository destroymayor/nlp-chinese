import process from "process";
import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt",
  stopWordDict: "./jieba/stop_words.utf8"
  // userDict: "./jieba/userdict.utf8"
});

import {
  readFileAsync,
  fs_appendFileSync,
  fs_writeFileSync,
  exportResult
} from "./src/fsAsync";
import {
  replaceCumulative
} from "./src/ArrayProcess.js";

//dice
import stringSimilarity from "string-similarity";
//levenshtein
import {
  similarity
} from "./src/Calculation";
import wuzzy from "wuzzy";

const SpecialSymbolCode = "[ ，,？。`-~～!@#$^&*()=|「」{}/\"'：；:;'\\[\\].<>/?~！@#￥……&*（）——|{}《》【】．、‘”“'%+_-]";

//詞組合句子生成
const KeywordCombinationReplaceAll = async (ReplacedSentenceFile, CombinedWordFile, output, GenerationsNumber) => {
  //產生句數量計數
  let num = 0;
  const InterrogativeSentenceRegexPattern = "\\?|？|為什麼|嗎|如何|如果|若要|是否|請將|可能|多少|將|什麼|請"; //疑問句pattern

  //read file
  const BeingReplaceData = await readFileAsync(ReplacedSentenceFile);
  const BecomeData = await readFileAsync(CombinedWordFile);

  JSON.parse(BeingReplaceData).map(item => {
    //if (item.article_title.match(new RegExp(InterrogativeSentenceRegexPattern, "g"))) {
    // 只取疑問句
    const BeingReplaceListTagNoun = [];
    const BeingReplaceListTagVerb = [];

    const sentence = item.article_title.replace(new RegExp(SpecialSymbolCode, "g"), "");
    // BeingReplaceData Noun and Verb list
    nodejieba.cut(sentence, true).map(CutValue => {
      nodejieba.tag(CutValue).map(CutTagValue => {
        //Noun and word length > 1
        if (CutTagValue.tag === "n" && CutTagValue.word.length > 1) {
          BeingReplaceListTagNoun.push(CutTagValue.word);
        }
        // //Verb and word length > 1
        if (CutTagValue.tag === "v" && CutTagValue.word.length > 1) {
          //保留疑問句pattern字串
          if (CutTagValue.word.match(new RegExp(InterrogativeSentenceRegexPattern, "g"))) {
            BeingReplaceListTagVerb.push(CutTagValue.word);
          }
        }
      });
    });

    Object.values(JSON.parse(BecomeData)).map(BecomeDataItem => {
      BecomeDataItem.item.map(BecomeDataItemValue => {
        if (BecomeDataItemValue.hasOwnProperty("v")) {
          if (
            BeingReplaceListTagNoun.length === BecomeDataItemValue.n.length &&
            BeingReplaceListTagVerb.length === BecomeDataItemValue.v.length
          ) {
            //組合替換名詞
            const ResultSentenceNoun = replaceCumulative(sentence, BeingReplaceListTagNoun, BecomeDataItemValue.n);

            //組合替換動詞
            const ResultSentenceVerb = replaceCumulative(ResultSentenceNoun, BeingReplaceListTagVerb, BecomeDataItemValue.v);

            const OutputResultJSON =
              '{"question":"' + ResultSentenceVerb + '","answer":"' + BecomeDataItemValue.sourceText + '"},\n';
            fs_appendFileSync(output, OutputResultJSON, err => {
              if (err) console.log("write", err);
            });

            //控制產生數量
            num++;
            if (num == GenerationsNumber) {
              process.exit(0);
            }
          }
        }
      });
    });
    // }
  });
};

// 收斂 尋找QA最佳對
const SearchSimilarSentences = async (GenerateSentenceFile, Threshold) => {
  const GenerateSentenceData = await readFileAsync(GenerateSentenceFile);

  JSON.parse(GenerateSentenceData).map(SentenceValue => {
    const Q = SentenceValue.question.replace(new RegExp(SpecialSymbolCode, "g"), "");
    const A = SentenceValue.answer.replace(new RegExp(SpecialSymbolCode, "g"), "");
    //dice
    // if (stringSimilarity.compareTwoStrings(Q, A) > Threshold) {
    //   //console.log("dice", stringSimilarity.compareTwoStrings(Q, A).toFixed(3), "Q=> ", Q, "A=> ", A);
    //   fs_appendFileSync(
    //     "./file/output/QA_dice.txt",
    //     stringSimilarity.compareTwoStrings(Q, A).toFixed(3) + " Q=> " + Q + " A=>" + A + "\n"
    //   );
    // }

    // //jaccard
    // if (wuzzy.jaccard(Q, A) > Threshold) {
    //   fs_appendFileSync("./file/output/QA_jaccard.txt", wuzzy.jaccard(Q, A).toFixed(3) + " Q=> " + Q + " A=>" + A + "\n");
    //   //console.log("jaccard", wuzzy.jaccard(Q, A).toFixed(3), "Q=> ", Q, "A=> ", A);
    // }

    // // levenshtein
    // if (wuzzy.levenshtein(Q, A) >= Threshold) {
    //   fs_appendFileSync("./file/output/QA_levenshtein.txt", wuzzy.levenshtein(Q, A).toFixed(3) + " Q=> " + Q + " A=>" + A + "\n");
    //   // console.log("levenshtein ", wuzzy.levenshtein(Q, A).toFixed(3), "Q=> ", Q, "A=> ", A);
    // }

    // jarowinkler
    if (wuzzy.jarowinkler(Q, A) >= Threshold) {
      fs_appendFileSync(
        "./file/output/QA_jarowinkler1.txt",
        wuzzy.jarowinkler(Q, A).toFixed(3) + " Q=> " + Q + " A=>" + A + "\n"
      );
      console.log("jarowinkler ", wuzzy.jarowinkler(Q, A).toFixed(3), "Q=> ", Q, "A=> ", A);
    }
  });
};

// KeywordCombinationReplaceAll(
//   "./file/phone/Phone_1.json",
//   "./file/Samsung/Samsung_Combination.json",
//   "./file/output/QA.txt",
//   300000
// );

SearchSimilarSentences("./file/output/QA.json", 0.4);
