export default {
  /**
   * 特殊符号替换 *
   */
  symbolReplace: function (val) {
    return val.replace(/@/g, "'");
  },
  isNull(val) {
    return undefined === val || null === val;
  },
  isNotNull(val) {
    return !this.isNull(val);
  },
  isEmpty(val) {
    if (undefined === val || null === val) {
      return true;
    }
    if (val instanceof Date) {
      return null == val;
    }
    if (Array.isArray(val)) {
      return 0 === val.length;
    }
    if (typeof val === 'object') {
      return Object.keys(val).length === 0;
    }
    return 0 === String(val).trim().length;
  },
  isNotEmpty(val) {
    return !this.isEmpty(val);
  }

}