function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function isInMap(value, map) {
  return map.hasOwnProperty(value);
}

function words(message) {
    return message.split(" ");
}

/** inclusive */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.getRandomInt = getRandomInt;
exports.isInMap = isInMap;
exports.isInArray = isInArray;
exports.words = words;
