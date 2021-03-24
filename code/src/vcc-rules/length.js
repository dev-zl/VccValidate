import VccUtils from '../vcc-utils/index';


// const attributes = {
//   message: new String(),
//   min: new Number(),
//   max: new Number(),
// }

/**
 *
 * length
 * zh-cn:至少需要一个min和max选项.
 * en-us:min and max options is required.
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @returns {Boolean}  true:不通过 false:通过
 */
const validate = function (value, $field, validateRule) {
  if (VccUtils.isEmpty(value)) {
    return true;
  }
  if (VccUtils.isEmpty(validateRule.max) && VccUtils.isEmpty(validateRule.min)) {
    console.error(`VccValidate: validateRule [length] error,the reason: validate field ${$field.fieldName}  min and max options is required.`);
    return true;
  }

  if (VccUtils.isEmpty(validateRule.max) || VccUtils.isEmpty(validateRule.min)) {
    if (Array.isArray(value)) {
      if (VccUtils.isNotEmpty(validateRule.min)) {
        return value.length < validateRule.min;
      }
      if (VccUtils.isNotEmpty(validateRule.max)) {
        return value.length > validateRule.max;
      }
    }
    if (VccUtils.isNotEmpty(validateRule.min)) {
      return String(value).length < validateRule.min;
    }
    if (VccUtils.isNotEmpty(validateRule.max)) {
      return String(value).length < validateRule.min;
    }
  }
  if (VccUtils.isNotEmpty(validateRule.max) && VccUtils.isNotEmpty(validateRule.min)) {
    if (Array.isArray(value)) {
      return value.length < validateRule.min || value.length > validateRule.max;
    }
    return String(value).trim().length < validateRule.min || String(value).trim().length > validateRule.max;
  }
}
export {
  validate,
}
export default {
  validate
}