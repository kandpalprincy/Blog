

exports.text_truncate = function(body, length, ending) {
if (length == null) {
  length = 100;
}
if (ending == null) {
  ending = '...';
}
if (body.length > length) {
  return body.substring(0, length - ending.length) + ending;
} else {
  return body;
}
};
