import VccUtils from '../vcc-utils/index.js';


/**
 * isInt
 * zh-cn:检查字符串是否为整数.
 * en-us:check if the string is an integer.
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !validator.isInt(value, validateRule.options);
}
export {
  validate,
}

export default {
  validate
}