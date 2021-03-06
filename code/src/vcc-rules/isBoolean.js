import VccUtils from '../vcc-utils/index';
import isBoolean from 'validator/lib/isBoolean';


/**
 * isBoolean
 * zh-cn:检查字符串是否是布尔值.
 * en-us:check if a string is a boolean.
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !isBoolean(value);
}
export {
  validate,
}

export default {
  validate
}