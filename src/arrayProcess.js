const replaceBulk = (str, findArray, replaceArray) => {
  let i,
    regex = [],
    map = {};
  for (i = 0; i < findArray.length; i++) {
    regex.push(findArray[i].replace(/([-[\]{}()*+?.\\^$|#,])/g, "\\$1"));
    map[findArray[i]] = replaceArray[i];
  }
  regex = regex.join("|");
  str = str.replace(new RegExp(regex, "g"), matched => {
    return map[matched];
  });
  return str;
};

const replaceCumulative = (Sentence, FindList, ReplaceList) => {
  for (let i = 0; i < FindList.length; i++) Sentence = Sentence.replace(new RegExp(FindList[i]), "(" + ReplaceList[i] + ")");
  return Sentence;
};

//陣列去重複 prop = 給予key name
const removeDuplicates = (originalArray, prop) => {
  var newArray = [];
  var lookupObject = {};

  for (var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for (i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;
};

const DeduplicationMergedObject2 = array => {
  const SeenObject = {};
  return array.filter(entry => {
    let previous;
    if (SeenObject.hasOwnProperty(entry.sentence)) {
      previous = SeenObject[entry.sentence];
      previous.tag.push(entry.tag);
      return false;
    }
    if (!Array.isArray(entry.tag)) {
      entry.tag = [entry.tag];
    }
    SeenObject[entry.sentence] = entry;
    return true;
  });
};

export { replaceBulk, replaceCumulative, removeDuplicates, DeduplicationMergedObject2 };
