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
  if (Vocabulary == "n") {
    for (let i = 0; i < find.length; i++) str = str.replace(new RegExp(find[i]), "【" + replace[i] + "】");
  }
  if (Vocabulary == "v") {
    for (let i = 0; i < find.length; i++) str = str.replace(new RegExp(find[i]), "(" + replace[i] + ")");
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

export { replaceBulk, replaceCumulative, removeDuplicates };
