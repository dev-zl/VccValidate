/**
 * 一些缓存信息
 */
export default class Cache {
  constructor() {

    /**
     * 验证字段的对应的html输入 或者 vue组件
     * value array type
     */
    this.fieldAllMap = new Map();
    /**
     * 提交的按钮 对应的html输入 或者 vue组件 node
     */
    this.submitButtonNodeMap = new Map();

  }
}