import process from "process";
import nodejieba from "nodejieba";

nodejieba.load({
  dict: "./jieba/dict.txt",
  stopWordDict: "./jieba/stop_words.utf8",
  userDict: "./jieba/userdict.utf8"
});

import {
  readFileAsync,
  fs_appendFileSync,
  fs_writeFileSync,
  exportResult
} from "./src/fsAsync";

import stringSimilarity from "string-similarity"; //dice
import {
  similarity
} from "./src/Calculation"; //levenshtein

import wuzzy from "wuzzy";

const SpecialSymbolCode = "[ ，,？。`-~～!@#$^&*()=|「」{}/\"'：；:;'\\[\\].<>/?~！@#￥……&*（）——|{}《》【】．、‘”“'%+_-]";
const InterrogativeSentenceRegexPattern =
  "\\?|？|嗎|為什麼|什麼|如何|如果|若要|是否|請將|在哪|哪裡|可能|多少|什麼|請教|請問|請益|問題|有沒有"; //疑問句pattern

const replaceCumulative = (Sentence, FindList, ReplaceList, word) => {
  if (word == "n") {
    FindList.map((value, i) => {
      Sentence = Sentence.replace(new RegExp(FindList[i]), "(" + ReplaceList[i] + ")");
    });
  }
  if (word == "v") {
    FindList.map((value, i) => {
      Sentence = Sentence.replace(new RegExp(FindList[i]), "[" + ReplaceList[i] + "]");
    });
  }
  return Sentence;
};

//詞組合句子生成
const KeywordCombinationReplaceAll = async (ReplacedSentenceFile, CombinedWordFile, output, GenerationsNumber) => {
  let num = 0; //產生句數量計數
  const BeingReplaceData = await readFileAsync(ReplacedSentenceFile); //read file
  const BecomeData = await readFileAsync(CombinedWordFile); //read file

  await JSON.parse(BeingReplaceData).map(item => {
    const BeingReplaceListTagNoun = [];
    const BeingReplaceListTagVerb = [];
    if (item.article_title.match(new RegExp(InterrogativeSentenceRegexPattern, "g"))) {
      // 只取疑問句

      const sentence = item.article_title.replace(new RegExp(SpecialSymbolCode, "g"), "");
      nodejieba.extract(sentence, 5).map(CutValue => {
        // BeingReplaceData Noun and Verb list
        nodejieba.tag(CutValue.word).map(CutTagValue => {
          if (CutTagValue.tag === "n" && CutTagValue.word.length > 1) {
            //Noun and word length > 1
            BeingReplaceListTagNoun.push(CutTagValue.word);
          }
          if (CutTagValue.tag === "v" && CutTagValue.word.length > 1) {
            //Verb and word length > 1
            if (!CutTagValue.word.match(new RegExp(InterrogativeSentenceRegexPattern, "g"))) {
              //保留疑問句pattern字串
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
              const ResultSentenceNoun = replaceCumulative(sentence, BeingReplaceListTagNoun, BecomeDataItemValue.n, "n");
              //組合替換動詞
              const ResultSentenceVerb = replaceCumulative(
                ResultSentenceNoun,
                BeingReplaceListTagVerb,
                BecomeDataItemValue.v,
                "v"
              );

              // const OutputResultJSON =
              //   '{"sourceText":"' +
              //   sentence +
              //   '","question":"' +
              //   ResultSentenceVerb +
              //   '","answer":"' +
              //   BecomeDataItemValue.sourceText +
              //   '"},\n';

              // fs_appendFileSync(output, OutputResultJSON);

              num++; //控制產生數量
              num == GenerationsNumber ? process.exit(0) : null;
            }
          }
        });
      });
    }
  });
};

// 收斂 尋找QA最佳對
const SearchSimilarSentences = async (GenerateSentenceFile, Threshold, ThresholdAfter) => {
  const GenerateSentenceData = await readFileAsync(GenerateSentenceFile);

  JSON.parse(GenerateSentenceData).map(SentenceValue => {
    const sourceText = SentenceValue.sourceText.replace(new RegExp(SpecialSymbolCode, "g"), "");
    const Q = SentenceValue.question.replace(new RegExp(SpecialSymbolCode, "g"), "");
    const A = SentenceValue.answer.replace(new RegExp(SpecialSymbolCode, "g"), "");
    if (Q.match(new RegExp(InterrogativeSentenceRegexPattern, "g"))) {
      //dice 0.2 0.25
      if (stringSimilarity.compareTwoStrings(Q, A) > 0.2 && stringSimilarity.compareTwoStrings(Q, A) < 0.25) {
        //console.log("dice", stringSimilarity.compareTwoStrings(Q, A).toFixed(3), "Q=> ", Q, "A=> ", A);
        const output =
          '{"sim":"' +
          stringSimilarity.compareTwoStrings(Q, A).toFixed(3) +
          '","N":"' +
          sourceText +
          '","Q":"' +
          Q +
          '","A":"' +
          A +
          '"},\n';
        //fs_appendFileSync('./file/output/QA_dice.json', output);
        fs_appendFileSync(
          "./file/output/QA_dice.txt",
          stringSimilarity.compareTwoStrings(Q, A).toFixed(3) + " , " + sourceText + " , " + Q + " , " + A + "\n"
        );
      }

      // //jaccard 0.3 0.4
      if (wuzzy.jaccard(Q, A) >= 0.3 && wuzzy.jaccard(Q, A) <= 0.4) {
        const output =
          '{"sim":"' + wuzzy.jaccard(Q, A).toFixed(3) + '","N":"' + sourceText + '","Q":"' + Q + '","A":"' + A + '"},\n';
        //fs_appendFileSync('./file/output/QA_jaccard.json', output);
        fs_appendFileSync(
          "./file/output/QA_jaccard.txt",
          wuzzy.jaccard(Q, A).toFixed(3) + " , " + sourceText + " , " + Q + " , " + A + "\n"
        );
      }

      // // levenshtein 0.4 0.5
      if (wuzzy.levenshtein(Q, A) >= 0.4 && wuzzy.levenshtein(Q, A) <= 0.5) {
        const output =
          '{"sim":"' + wuzzy.levenshtein(Q, A).toFixed(3) + '","N":"' + sourceText + '","Q":"' + Q + '","A":"' + A + '"},\n';
        //fs_appendFileSync('./file/output/QA_levenshtein.json', output);
        fs_appendFileSync(
          "./file/output/QA_levenshtein.txt",
          wuzzy.levenshtein(Q, A).toFixed(3) + " , " + sourceText + " , " + Q + " , " + A + "\n"
        );
      }

      // jarowinkler 0.6 0.7
      const JarowinklerList = [];
      if (wuzzy.jarowinkler(Q, A) >= 0.6 && wuzzy.jarowinkler(Q, A) <= 0.7) {
        const output =
          '{"sim":"' + wuzzy.jarowinkler(Q, A).toFixed(3) + '","N":"' + sourceText + '","Q":"' + Q + '","A":"' + A + '"},\n';
        //fs_appendFileSync('./file/output/QA_jarowinkler.json', output);
        fs_appendFileSync(
          "./file/output/QA_jarowinkler.txt",
          wuzzy.jarowinkler(Q, A).toFixed(3) + " , " + sourceText + " , " + Q + " , " + A + "\n"
        );
      }
    }
  });
};

// KeywordCombinationReplaceAll(
//   "./file/phone/Phone_1.json",
//   "./file/Samsung/Samsung_Combination.json",
//   "./file/output/QA.txt",
//   100
// );

//SearchSimilarSentences("./file/output/QA.json", 0.3, 0.4);

const QAMatchVote = async () => {
  const diceData = await readFileAsync("./file/output/QA_dice.json");
  const jaccardData = await readFileAsync("./file/output/QA_jaccard.json");
  const levenshteinData = await readFileAsync("./file/output/QA_levenshtein.json");
  const jarowinklerData = await readFileAsync("./file/output/QA_jarowinkler.json");

  JSON.parse(levenshteinData).map(Data => {
    if (wuzzy.jarowinkler(Data.Q, Data.A) >= 0.6) {
      console.log(wuzzy.jarowinkler(Data.Q, Data.A).toFixed(3), "Q:", Data.Q, " A:", Data.A);
      const output = wuzzy.jarowinkler(Data.Q, Data.A).toFixed(3) + " , " + Data.N + " , " + Data.Q + " , " + Data.A + "\n";
      fs_appendFileSync("./file/output/QA_bestMatch.txt", output);
    }
  });
};

//QAMatchVote();
