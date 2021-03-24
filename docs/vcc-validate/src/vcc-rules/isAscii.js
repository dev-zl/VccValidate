import VccUtils from '../vcc-utils/index.js';


/**
 * isAscii
 * zh-cn:检查字符串是否仅包含ASCII字符.
 * en-us:check if the string contains ASCII chars only.
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !validator.isAscii(value);
}
export {
  validate,
}

export default {
  validate
}