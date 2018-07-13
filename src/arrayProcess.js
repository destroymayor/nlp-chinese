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

const replaceCumulative = (str, find, replace, Vocabulary) => {
  if (find.length == replace.length) {
    if (Vocabulary == "n") {
      for (let i = 0; i < find.length; i++) str = str.replace(new RegExp(find[i]), "【n" + replace[i] + "】");
    }

    if (Vocabulary == "v") {
      for (let i = 0; i < find.length; i++) str = str.replace(new RegExp(find[i]), "(v" + replace[i] + ")");
    }
  }
  return str;
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
