import VccUtils from '../vcc-utils/index.js';


/**
 * isURL
 * zh-cn:检查字符串是否为URL.
 * en-us:check if the string is an URL.
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !validator.isURL(value);
}
export {
  validate,
}

export default {
  validate
}