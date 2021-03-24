import VccUtils from '../vcc-utils/index.js';


/**
 * equals
 * zh-cn:检查字符串是否与比较匹配.
 * en-us:check if the string matches the comparison.
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @param {Map} allFieldValMap 所有验证字段的 val
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule, allFieldValMap) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !validator.equals(value, validateRule.comparison);
}
export {
  validate,
}

export default {
  validate
}