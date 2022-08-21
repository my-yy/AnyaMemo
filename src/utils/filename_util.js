//https://stackoverflow.com/questions/11100821/javascript-regex-for-validating-filenames
//合法的文件名

const isValid = (function () {
  var rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
  var rg2 = /^\./; // cannot start with dot (.)
  var rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
  return function isValid(fname) {
    if (fname.trim().length === 0) {
      return false
    }
    if (fname.length > 100) {
      return false
    }

    return rg1.test(fname) && !rg2.test(fname) && !rg3.test(fname);
  }
})();
module.exports = {
  isValid
}
