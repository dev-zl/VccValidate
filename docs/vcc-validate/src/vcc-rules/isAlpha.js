import VccUtils from '../vcc-utils/index.js';


/**
 * isAlpha
 * zh-cn:检查字符串是否只包含字母(a-zA-Z)
 * en-us:check if the string contains only letters (a-zA-Z).
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !validator.isAlpha(value);
}
export {
  validate,
}

export default {
  validate
}