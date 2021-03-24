import VccUtils from '../vcc-utils/index';
import isFloat from 'validator/lib/isFloat';


/**
 * isFloat
 * zh-cn:检查字符串是否为浮点数.
 * en-us:check if the string is a float.
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !isFloat(value, validateRule.options);
}
export {
  validate,
}

export default {
  validate
}