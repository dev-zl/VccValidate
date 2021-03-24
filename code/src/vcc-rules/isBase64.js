import VccUtils from '../vcc-utils/index';
import isBase64 from 'validator/lib/isBase64';

/**
 * isBase64
 * zh-cn:检查字符串是否为base64编码.
 * en-us:check if a string is base64 encoded.
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  return !isBase64(value);
}
export {
  validate,
}

export default {
  validate
}