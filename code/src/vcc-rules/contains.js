import VccUtils from '../vcc-utils/index';
import contains from 'validator/lib/contains';

/**
 * contains
 * zh-cn:检查字符串是否包含种子.
 * en-us:check if the string contains the seed.
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !contains(value, validateRule.seed);
};
export {
  validate,
}

export default {
  validate
}