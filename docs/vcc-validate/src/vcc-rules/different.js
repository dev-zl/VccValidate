import VccUtils from '../vcc-utils/index.js';
/**
 * different
 * zh-cn:	输入值与给定字段的值不同 如果验证相同,则验证失败.
 * en-us:	The input value is different from the value of the given field. If the verification is the same, the verification fails.
 * 只支持基本类型比较
 *
 * @param {Object} $field Field element
 * @param {Object} options Field options
 * @param {Map} allFieldValMap 所有验证字段的 val
 * @returns {Boolean} true:不通过 false:通过
 */
const validate = function (value, $field, validateRule, allFieldValMap) {
  if (VccUtils.isEmpty(value)) {
    return false;
  }
  //field
  let comparisonField = validateRule.field;
  if ('ERROR' === allFieldValMap.get(validateRule.field).state) {
    validateRule.triggerField = validateRule.field;
  } else {
    delete validateRule.triggerField;
  }
  let comparisonFieldValObj = allFieldValMap.get(comparisonField);
  return !(value === comparisonFieldValObj.newVal);
}
export {
  validate,
}
export default {
  validate
}