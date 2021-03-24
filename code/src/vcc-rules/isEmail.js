import VccUtils from '../vcc-utils/index';
import isEmail from 'validator/lib/isEmail';

/**
 * isEmail
 * zh-cn:检查字符串是否是电子邮件.
 * en-us:check if the string is an email.
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !isEmail(value);
}
export {
  validate,
}

export default {
  validate
}