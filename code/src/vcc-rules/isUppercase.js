import VccUtils from '../vcc-utils/index';
import isUppercase from 'validator/lib/isUppercase';


/**
 * isUppercase
 * zh-cn:检查字符串是否为大写.
 * en-us:check if the string is uppercase.
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !isUppercase(value);
}
export {
  validate,
}

export default {
  validate
}