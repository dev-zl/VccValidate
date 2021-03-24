import VccUtils from '../vcc-utils/index';
import isBefore from 'validator/lib/isBefore';


/**
 * isBefore
 * zh-cn:检查字符串是否是指定日期之前的日期
 * en-us:check if the string is a date that's before the specified date.
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !isBefore(value, validateRule.date);
}
export {
  validate,
}

export default {
  validate
}