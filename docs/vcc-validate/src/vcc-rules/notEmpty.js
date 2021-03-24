import VccUtils from '../vcc-utils/index.js';
  /**
   * notEmpty
   * zh-cn:检查输入值是否为空
   * en-us:Check if input value is empty or not
   *
   * @param {Object} $field Field element
   * @param {Object} options Field options
   * @returns {Boolean} true:不通过 false:通过
   */
  const validate = function (value, $field, validateRule) {
    return VccUtils.isEmpty(value);
  }
  export {
    validate,
  }

  export default {
    validate
  }