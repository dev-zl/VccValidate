import VccUtils from '../vcc-utils/index';
import isAlphanumeric from 'validator/lib/isAlphanumeric';


/**
 * isAlphanumeric
 * zh-cn:检查字符串是否只包含字母和数字
 * en-us:check if the string contains only letters and numbers.
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !isAlphanumeric(value);
}
export {
  validate,
}

export default {
  validate
}