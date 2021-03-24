import VccUtils from '../vcc-utils/index';
/**
 * regexp
 * zh-cn:检查值是否与给定的Javascript正则表达式匹配
 * en-us:Check if the value matches given Javascript regular expression
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  let expression = validateRule.reg;
  if (typeof validateRule.reg === 'string') {
    expression = new RegExp(validateRule.reg);
  }
  return !(expression.test(String(value)));
}
export {
  validate,
}
export default {
  validate
}