/**
 * callback
 * zh-cn:回调验证器 可以用于 异步后端验证
 * en-us:callback can be use on Async Backend Validation
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule, allFieldValMap, api) {
  let result = validateRule.callback(value, $field, validateRule, allFieldValMap, api);
  if (undefined === result) {
    result = false;
  }
  return result;
}
export {
  validate,
}
export default {
  validate
}