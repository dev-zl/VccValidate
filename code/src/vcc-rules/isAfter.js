import VccUtils from '../vcc-utils/index';
import isAfter from 'validator/lib/isAfter';


/**
 * isAfter
 * zh-cn:检查字符串是否是指定日期之后的日期（默认为现在）.
 * en-us:check if the string is a date that's after the specified date (defaults to now).
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !isAfter(value, validateRule.date);
}
export {
  validate,
}

export default {
  validate
}