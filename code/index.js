/**
 * VccValidate
 * 基于 Vue.js 的验证框架
 * 简单: 基于模板的验证既熟悉又易于设置.
 * 灵活: 验证HTML输入和Vue组件，生成本地化错误，可扩展，它可以完成所有操作.
 * 配置: 不受影响的配置，一切都是可选的.
 * 特色: 解决了 HTML输入和Vue组件 border 的问题.
 *
 * # install with npm
 * npm install vcc-validate
 * Vue.use(VccValidate);
 *
 * ------------------------------------------------
 * 这个插件的灵感来自 bootstrapValidator , vue.$watch
 * #兼容性
 * 此库使用 ES6 推荐使用 vue.js 2.1及以上 因此请确保支持的浏览器
 * 听诊器 Validator Plugin
 * @author zl
 * @updateDate yyyy-MM-dd
 *
 * todo: 如下
 * 1. autoDisableEnableSubmitButton 完成
 * 2. destroy 销毁插件 没有完成 (完成)
 * 3. 智能销毁 当 vcc-field 销毁全部完成 就销毁整个 当前的 VccValidate  完成
 * 4. 完善 vcc-rules 基本完成
 * 5. 支持注入 vcc-rules (完成)
 * 6. 继续完善 VccValidateConfig  配置选项
 * 7. 文档的补充
 * 8. debugLog + log 的完善
 * 9. i18n国际化 
 * 10. 全局 HTML输入和Vue组件 borderColor 指令 <,> ,=, - 完成
 *
 * 
 */

// 去抖（延迟）验证
// 您可以指定延迟以对输入事件进行去抖动，您可能希望等待用户停止键入然后验证字段以限制验证触发频率。
// 这可以通过data-vv-delay在要验证的字段上添加属性来实现，并为其分配您要等待的毫秒数。

import VccCache from './src/vcc-cache/cache';
import VccMQ from './src/vcc-mq/mq';
import VccRules, {
  extend,
  remove
} from './src/vcc-rules/index';
import VccUtils from './src/vcc-utils/index';
import VccConf, {
  getTagMappingCmd,
  getMappingFunction,
  configure
} from './src/vcc-conf/conf';

/**发布/订阅 模式  初始化 */
let mq = new VccMQ();
let cacheObj = new VccCache();


let VccValidateConfig = {
  /**
   * 所有配置选项
   */
  config: {
    /**是否打开警告线  默认 false*/
    openWarningLine: false,
    /**警告线颜色 默认 red  */
    warningLineColor: 'red',
    /**
     * 自动 （禁用|启用） 提交按钮  默认 false
     * 如果验证不通过将会 禁用提交按钮 通过则启用
     * ps:请使用 v-vcc-submit-button 标注你的 提交按钮
     */
    autoDisableEnableSubmitButton: false,
    /**
     * v-vcc-submit-button 对应的 value  
     */
    submitButtonName: '',
    /**
     * 验证的字段
     */
    fields: {}
  },
  /**
   * 字段验证状态
   */
  finalStatusType: {
    /**成功 */
    success: 'SUCCESS',
    /**错误 */
    error: 'ERROR',
    /**没验证 */
    no_verify: 'NO_VERIFY'
  }

};
export class VccValidate {

  static install(_Vue, CONFIG) {
    if (VccUtils.isNotNull(CONFIG)) {
      configure(CONFIG);
    }
    //定义全局变量
    _Vue.prototype.VccValidate = VccValidate;
    _Vue.directive('vcc-submit-button', {
      bind: function (el, binding, vnode) {
        let value = binding.value;
        const key = `${vnode.context._uid}_SUBMIT_BUTTON_NODE_${value}`;
        cacheObj.submitButtonNodeMap.set(key, el);
      },
      unbind: function (el, binding, vnode) {
        //清理工作
        //例如，删除bind()添加的事件监听器
        let value = binding.value;
        const key = `${vnode.context._uid}_SUBMIT_BUTTON_NODE_${value}`;
        cacheObj.submitButtonNodeMap.delete(key);
        el.disabled = false;
      }
    });

    _Vue.directive('vcc-field', {
      inserted: function (el, binding, vnode) {
        let value = binding.value;
        const key = `${vnode.context._uid}_${value}`;
        let fieldAllMapValList = cacheObj.fieldAllMap.get(key);
        if (VccUtils.isNull(fieldAllMapValList)) {
          fieldAllMapValList = [];
        }
        fieldAllMapValList.push({
          'hnode': el
        });
        cacheObj.fieldAllMap.set(key, fieldAllMapValList);
        if (VccConf.debugLog) {
          console.log(value + ' -已绑定到节点');
        }
        //发布消息
        mq.deliver(key);
      },
      unbind: function (el, binding, vnode) {
        //清理工作
        //例如，删除bind()添加的事件监听器
        let value = binding.value;
        const key = `${vnode.context._uid}_${value}`;
        if (VccConf.debugLog) {
          console.log(value + '-执行销毁节点');
        }
        //发布销毁消息
        let unbind_key = `unbind_${key}`;
        mq.deliver(unbind_key);
        //清理 1 mq 存放订阅者信息 subscribers 里某些的数据
        //清理 2 fieldAllMap 里某些的数据
        mq.subscribers.delete(key);
        cacheObj.fieldAllMap.delete(key);
      }
    });

  }

  /**
   * 构造函数
   * @param {Vue} _vm
   * @param {VccValidateConfig.config} config
   */
  constructor(_vm, config) {
    if (VccUtils.isNotNull(_vm) || VccUtils.isNotNull(config)) {
      this.init(_vm, config);
    }
    //当前实例所有的 data
    this.currentObjData = {
      /**验证的字段名称 ps:这里存储是 没处理 @ 的数据 */
      fieldName: [],
      /**验证的字段错误信息 */
      fieldError: new Map(),
      /**验证的字段状态 */
      fieldStatus: new Map(),
      /**验证的字段 配置选项 */
      fieldOptions: new Map(),
      /**field的 取消监视 */
      fieldUnwatch: new Map(),
      /**field 具有边框 node */
      fieldBorderList: new Map(),
      /**field 具有边框 node  Border 原始数据 */
      fieldBorderDefaultStyle: new Map(),
      /**提交按钮 node */
      submitButtonNone: null,
      /**验证的字段 val */
      fieldValMap: new Map(),
      /**
       * 事件 ko 控制器
       * 用于字段验证完成触发其他字段的验证的 事件控制
       * 例如:
       *  field A 验证完成 要去触发 field B, field B 验证完成 又去触发  field A
       *  这样就造成了事件的死循环. eventKo 就是为了解决这个问题 (ko它)
       */
      eventKo: new Map()
    };
    //当前配置
    this.currentObjConfig = {};
  }

  init(_vm, config) {
    this.Vue = _vm
    this.api().destroy();
    let copyConfig = Object.assign({}, VccValidateConfig.config);
    config = Object.assign(copyConfig, config);
    this.currentObjConfig = config;
    if (VccUtils.isNotEmpty(config.fields)) {
      let _this = this;
      return new Promise((resolve1) => {
        let fieldsKey = Object.keys(config.fields);
        let promiseSize = fieldsKey.length;
        let resolveSize = 0;
        fieldsKey.forEach((fieldStr) => {
          new Promise((resolve2) => {
            _this.api().addField(fieldStr, config.fields[fieldStr], false, null, resolve2);
          }).then(res => {
            resolveSize++;
            if (promiseSize === resolveSize) {
              resolve1();
            }
          });
        });
      }).then(res => {
        _this.utils().submitButtonStatusVariety();
      });
    }

  }
  utils() {
    let _vccObj = this;
    return {
      /**销毁所有 Field的 监听  not is api */
      unwatchAll() {
        let unwatchList = _vccObj.currentObjData.fieldUnwatch;
        unwatchList.forEach((unwatch) => {
          unwatch();
        });
        _vccObj.currentObjData.fieldUnwatch.clear();
      },
      /**
       * 获取不是必填字段
       * @param {*} fieldStr 
       * @param {*} options 
       */
      getIsNotRequiredField() {
        let isNotRequiredFieldMap = new Map();
        _vccObj.currentObjData.fieldName.forEach(name => {
          let getOptions = _vccObj.currentObjData.fieldOptions.get(name);
          if (undefined === getOptions.validators['notEmpty']) {
            isNotRequiredFieldMap.set(name, name);
          }
        });
        return isNotRequiredFieldMap;
      },
      /**
       * getNodeMappingName
       * @param {*} $node hnode
       */
      getNodeMappingName($node) {
        if (VccUtils.isNull($node.__vue__)) {
          return $node.tagName;
        }
        return $node.__vue__.$vnode.componentOptions.tag;
      },
      /**
       * 提交按钮状态多样性(变化)
       */
      submitButtonStatusVariety() {
        //开启 自动 （禁用|启用） 提交按钮
        if (_vccObj.currentObjConfig.autoDisableEnableSubmitButton) {
          if (_vccObj.api().isValid()) {
            _vccObj.api().disableEnableSubmitButton(false);
          } else {
            _vccObj.api().disableEnableSubmitButton(true);
          }
        }
      }
    }
  }

  api() {
    let _vccObj = this;
    return {
      /**
       * 添加新字段
       * @param {String} fieldStr
       * @param {Object} options
       * @param {Boolean} immediate 是否立刻验证 默认 false
       * @param {Promise} verifyCallback 验证完成的回调  Promise==resolve
       * @param {Promise} addVerifyCallback 添加验证完成的回调 Promise==resolve
       */
      addField: function (fieldStr, options, immediate = false, verifyCallback = null, addVerifyCallback = null) {
        if (VccUtils.isEmpty(fieldStr)) {
          console.error(`VccValidate: addField error field Name is Empty`);
          return;
        }
        //key
        const key = `${_vccObj.Vue._uid}_${fieldStr}`;
        //防止重复
        if (!_vccObj.currentObjData.fieldName.includes(fieldStr)) {
          _vccObj.currentObjData.fieldName.push(fieldStr);
        }
        _vccObj.currentObjData.fieldOptions.set(fieldStr, options);
        _vccObj.currentObjData.fieldStatus.set(fieldStr, []);
        let _this = this;
        let addFieldInsideFunction = function () {
          let getOptions = _vccObj.currentObjData.fieldOptions.get(fieldStr);
          //找到的 具有边框 node
          //使用 查找边框   条件:当前配置中的 警告线 已开启
          if (true === _vccObj.currentObjConfig.openWarningLine) {
            let fieldMapInfoList = cacheObj.fieldAllMap.get(key);
            //找到的 具有边框 node
            let nodeBorderList = [];
            // 无论一个 field 下的有多少个 hnode 但它们的style 都应该是一样的 
            let copyStyle = {};
            fieldMapInfoList.forEach((fieldNode, index) => {
              let nodeBorder = _this.nodeMapping(fieldNode.hnode);
              if (VccUtils.isNull(nodeBorder)) {
                console.warn(`VccValidate: ${fieldStr} nodeMapping is null`);
                return;
              }
              nodeBorderList.push(nodeBorder);
              if (0 === index) {
                Object.assign(copyStyle, nodeBorder.style);
              }
            });
            _vccObj.currentObjData.fieldBorderList.set(fieldStr, nodeBorderList);
            let oldStyle = _vccObj.currentObjData.fieldBorderDefaultStyle.get(fieldStr);
            if (VccUtils.isNull(oldStyle)) {
              _vccObj.currentObjData.fieldBorderDefaultStyle.set(fieldStr, copyStyle);
            }
          }
          //保证只能设置监听一次
          if (VccUtils.isNotNull(_vccObj.currentObjData.fieldUnwatch.get(fieldStr))) {
            return;
          }
          //设置默认状态
          _vccObj.currentObjData.fieldStatus.set(fieldStr, [{
            'status': VccValidateConfig.finalStatusType.no_verify
          }]);
          let evalStr = ''; {
            //替换 @
            let replaceFieldStr = VccUtils.symbolReplace(fieldStr);
            if (replaceFieldStr.substring(0, 1) === '[') {
              evalStr = `_vccObj.Vue.$data${replaceFieldStr}`;
            } else {
              evalStr = `_vccObj.Vue.$data.${replaceFieldStr}`;
            }
            let evalVal = eval(evalStr);
            let fieldValObj = {
              //**上一次输入的数据
              'oldVal': evalVal,
              //**现在的输入的数据
              'newVal': evalVal,
              //**状态
              'state': VccValidateConfig.finalStatusType.no_verify
            }
            _vccObj.currentObjData.fieldValMap.set(fieldStr, fieldValObj);
          }
          let unwatch = _vccObj.Vue.$watch(function () {
            return eval(evalStr);
          }, function (newVal, oldVal) {
            let errorList = [];
            let statusList = [];
            let validatorsKeys = Object.keys(getOptions.validators);
            // 触发验证器列表
            let triggerValidatorsList = new Set();
            // 总状态 默认成功一个规则失败即是失败
            let totalState = VccValidateConfig.finalStatusType.success;
            validatorsKeys.forEach((validatorRuleName, index) => {
              //当前验证规则
              let validatorObj = getOptions.validators[validatorRuleName];
              //拼接数据
              let $field = {
                /**当前验证字段名称 */
                'fieldName': fieldStr,
                /**上一次输入的数据 */
                'oldVal': oldVal
              };
              // 当前state 不是 no_verify 就将 state 设置为空
              // 因为在输入的验证中你并不知道 验证结果
              let getCurrentFieldVal = _vccObj.currentObjData.fieldValMap.get(fieldStr);
              if (getCurrentFieldVal.state !== VccValidateConfig.finalStatusType.no_verify) {
                getCurrentFieldVal.state = '';
                _vccObj.currentObjData.fieldValMap.set(fieldStr, getCurrentFieldVal);
              }
              let verifyResult = VccRules[validatorRuleName].validate(newVal, $field, validatorObj, _vccObj.currentObjData.fieldValMap, _vccObj.api());
              let statusObj = {
                'validatorRuleName': validatorRuleName,
                'status': ''
              };
              let errorObj = {
                'validatorRuleName': validatorRuleName,
                'message': '',
                '_uuid': `${index}${fieldStr}${validatorRuleName}`
              };
              if (verifyResult) {
                errorObj.message = validatorObj.message;
                statusObj.status = VccValidateConfig.finalStatusType.error;
                errorList.push(errorObj);
                // 总状态判断
                totalState = VccValidateConfig.finalStatusType.error;
              } else {
                statusObj.status = VccValidateConfig.finalStatusType.success;
              }
              // 判断是否触发其他字段的验证
              if (undefined !== validatorObj.triggerField) {
                triggerValidatorsList.add(validatorObj.triggerField);
              }
              statusList.push(statusObj);
            });
            let fieldValObj = {
              /**上一次输入的数据 */
              'oldVal': oldVal,
              /**现在的输入的数据 */
              'newVal': newVal,
              //**状态
              'state': totalState
            }
            let oldState= _vccObj.currentObjData.fieldStatus.get(fieldStr);
            _vccObj.currentObjData.fieldValMap.set(fieldStr, fieldValObj);
            _vccObj.currentObjData.fieldStatus.set(fieldStr, statusList);
            _vccObj.currentObjData.fieldError.set(fieldStr, errorList);
            //重新赋值， 而不是更改引用
            _vccObj.currentObjData.fieldStatus = new Map(_vccObj.currentObjData.fieldStatus);
            _vccObj.currentObjData.fieldError = new Map(_vccObj.currentObjData.fieldError);
            _vccObj.currentObjData.fieldValMap = new Map(_vccObj.currentObjData.fieldValMap);

            // 判断是否存在 mappingFunction
            let fieldMappingFunction = getMappingFunction(_vccObj.utils().getNodeMappingName(cacheObj.fieldAllMap.get(key)[0].hnode));
            if (null != fieldMappingFunction) {
              fieldMappingFunction(fieldStr, errorList.length > 0, errorList, cacheObj.fieldAllMap.get(key), oldState);
            }
            if (true === _vccObj.currentObjConfig.openWarningLine) {
              let nodeBorderListMap = _vccObj.currentObjData.fieldBorderList.get(fieldStr);
              let setStyle;
              nodeBorderListMap.forEach((nodeBorder, index) => {
                if (0 === index) {
                  setStyle = _vccObj.currentObjData.fieldBorderDefaultStyle.get(fieldStr);
                }
                if (VccUtils.isNotNull(nodeBorder)) {
                  if (errorList.length > 0) {
                    nodeBorder.style.border = "";
                    nodeBorder.style.border = `1px solid ${_vccObj.currentObjConfig.warningLineColor}`;
                    nodeBorder.style.outline = 'none';
                  } else {
                    nodeBorder.style.border = setStyle.border;
                    nodeBorder.style.outline = setStyle.outline;
                  }
                } else {
                  console.warn(`VccValidate: ${fieldStr} nodeBorder is null,openWarningLine error`);
                }
              });
            }
            _vccObj.utils().submitButtonStatusVariety();
            if (triggerValidatorsList.size > 0) {
              triggerValidatorsList.forEach(fs => {
                let getFsName = _vccObj.currentObjData.eventKo.get(fieldStr);
                if (fs === getFsName) {
                  _vccObj.currentObjData.eventKo.delete(fieldStr);
                } else {
                  // key 去的地方 ,value 来自于哪里
                  _vccObj.currentObjData.eventKo.set(fs, fieldStr);
                  _this.revalidateField(fs, function () {
                    _vccObj.currentObjData.eventKo.delete(fs);
                  });
                }
              });
            }
            if (VccUtils.isNotNull(verifyCallback)) {
              verifyCallback();
            }
          }, {
            'deep': true,
            'immediate': immediate
          });
          _vccObj.currentObjData.fieldUnwatch.set(fieldStr, unwatch);
          //回调
          if (VccUtils.isNotNull(addVerifyCallback)) {
            addVerifyCallback();
          }
        };
        //添加销毁字段  订阅者 
        let unbind_key = `unbind_${key}`;
        mq.addSubscriber(unbind_key, _vccObj.api().removeField);
        //检查当前配置 是否开启 警告线--> openWarningLine
        if (_vccObj.currentObjConfig.openWarningLine && VccUtils.isNull(cacheObj.fieldAllMap.get(key))) {
          //添加订阅者
          mq.addSubscriber(key, addFieldInsideFunction);
        } else {
          addFieldInsideFunction();
        }
      },
      /**
       * node 映射
       * @param {*} node 
       */
      nodeMapping: function ($node) {
        // <:上一个同胞元素 previousElementSibling
        // >:下一个同胞元素 nextElementSibling
        // +:父元素 parentNode  node 类型
        // -:子元素 children  HTMLCollection  类型
        // [x]: x 如节点有多个 x 代表第几个
        if (VccUtils.isNull($node.__vue__)) {
          return $node;
        }
        let tagName = $node.__vue__.$vnode.componentOptions.tag;
        let cmdStr = '$node.';
        const cmdList = getTagMappingCmd(tagName);
        if (VccUtils.isNull(cmdList)) {
          return null;
        }
        let cmdListIndex = cmdList.length;
        cmdList.forEach((cmd, index) => {
          switch (cmd) {
            case '<':
              cmdStr += 'previousElementSibling';
              break;
            case '>':
              cmdStr += 'nextElementSibling';
              break;
            case '+':
              cmdStr += 'parentNode';
              break;
            case '-':
              cmdStr += 'children';
              break;
            default:
              // 这里是 [x]
              cmdStr += cmd;
          }
          let ifAppend = true;
          let indexNext = (index + 1);
          // 判断 如果下一个cmd 是 [x] 就不追加 " . " 了
          if (indexNext < cmdListIndex) {
            if (cmdList[indexNext].indexOf('[') !== -1) {
              ifAppend = false;
            }
          }
          if (index !== (cmdListIndex - 1) && ifAppend) {
            cmdStr += '.';
          }
        });
        return eval(cmdStr);
      },
      /**销毁插件 */
      destroy: function () {
        let fieldUnwatch = _vccObj.currentObjData.fieldUnwatch;
        //销毁验证属性的监听...
        fieldUnwatch.forEach((unwatch) => {
          unwatch();
        });
        _vccObj.currentObjData.fieldUnwatch.clear();
        _vccObj.currentObjData.fieldStatus.clear();
        _vccObj.currentObjData.fieldOptions.clear();
        _vccObj.currentObjData.fieldError.clear();
        _vccObj.currentObjData.fieldValMap.clear();
        _vccObj.currentObjData.eventKo.clear();
        _vccObj.currentObjData.fieldError = new Map();
        //恢复 (验证字段的对应的html输入 或者 vue组件)的 border Color
        _vccObj.currentObjData.fieldBorderList.forEach((nodeBorderList, fieldStr) => {
          let setStyle;
          nodeBorderList.forEach((nodeBorder, index) => {
            if (0 === index) {
              setStyle = _vccObj.currentObjData.fieldBorderDefaultStyle.get(fieldStr);
            }
            nodeBorder.style.border = setStyle.border;
            nodeBorder.style.outline = setStyle.outline;
          });
        });
        _vccObj.currentObjData.fieldBorderList.clear();
        _vccObj.currentObjData.fieldBorderDefaultStyle.clear();
        _vccObj.currentObjData.fieldName=[];
        _vccObj.currentObjConfig.fields={}
        _vccObj.api().disableEnableSubmitButton(false);
      },
      /**
       * 手动验证表单。当您想要通过单击按钮或链接而不是提交按钮来验证表单时，它非常有用
       */
      validate: function () {
        //resolve1,reject1
        return new Promise((resolve1) => {
          //销毁所有 Field的 监听
          _vccObj.utils().unwatchAll();
          //重新注册监听 并即可验证
          let _this = this;
          let promiseSize = _vccObj.currentObjData.fieldName.length;
          if (promiseSize === 0) {
            resolve1();
          }
          let resolveSize = 0;
          _vccObj.currentObjData.fieldName.forEach((val) => {
            new Promise((resolve2) => {
              _this.addField(val, _vccObj.currentObjData.fieldOptions.get(val), true, resolve2);
            }).then(res => {
              resolveSize++;
              if (promiseSize === resolveSize) {
                resolve1();
              }
            });
          });
        });
      },
      /**
       * 如果所有表单字段全部验证通过，则返回 true。否则，返回false.
       * @param {Boolean} isDestroy 验证通过就销毁插件  true 销毁  false 不销毁 默认false
       */
      isValid: function (isDestroy = false) {
        let errorList = [];
        let isNotRequiredFieldMap = _vccObj.utils().getIsNotRequiredField();
        if (_vccObj.currentObjData.fieldStatus.length === 0) {
          if (isDestroy) {
            this.destroy();
          }
          return true;
        }
        _vccObj.currentObjData.fieldStatus.forEach((valList, key) => {
          valList.forEach(val => {
            if (VccUtils.isNull(val.status)) {
              return;
            }
            if (undefined !== isNotRequiredFieldMap.get(key) && (VccValidateConfig.finalStatusType.success === val.status || VccValidateConfig.finalStatusType.no_verify === val.status)) {
              return;
            }
            if (val.status !== VccValidateConfig.finalStatusType.success) {
              errorList.push(key);
            }
          });
        });
        if (0 !== errorList.length) {
          return false;
        }
        if (isDestroy) {
          this.destroy();
        }
        return true;
      },
      /**
       * 禁用或启用提交按钮
       * @param {*} cmd true 禁用 false 不禁用
       */
      disableEnableSubmitButton: function (cmd) {
        const key = `${_vccObj.Vue._uid}_SUBMIT_BUTTON_NODE_${_vccObj.currentObjConfig.submitButtonName}`;
        let node = cacheObj.submitButtonNodeMap.get(key);
        if (VccUtils.isNull(node)) {
          return;
        }
        node.disabled = cmd;
      },
      /**
       * 删除给定的字段
       */
      removeField: function (fieldStr) {
        if (VccUtils.isEmpty(fieldStr)) {
          console.error(`VccValidate: removeField error field Name is Empty`);
          return;
        }
        let unbindKey = `unbind_${_vccObj.Vue._uid}_`;
        if (fieldStr.indexOf(unbindKey) !== -1) {
          fieldStr = fieldStr.substring(unbindKey.length);
        }
        //取消监视 unwatch
        let unwatch = _vccObj.currentObjData.fieldUnwatch.get(fieldStr);
        if (undefined !== unwatch) {
          unwatch();
        }
        _vccObj.currentObjData.fieldUnwatch.delete(fieldStr);
        //fieldName
        let delFieldNameIndex = -1;
        _vccObj.currentObjData.fieldName.forEach((val, index) => {
          if (fieldStr === val) {
            delFieldNameIndex = index;
          }
        });
        if (delFieldNameIndex != -1) {
          _vccObj.currentObjData.fieldName.splice(delFieldNameIndex, 1);
        }
        //删除错误信息
        _vccObj.currentObjData.fieldError.delete(fieldStr);
        //删除字段状态
        _vccObj.currentObjData.fieldStatus.delete(fieldStr);
        //删除字段 配置选项
        _vccObj.currentObjData.fieldOptions.delete(fieldStr);
        //删除字段 val
        _vccObj.currentObjData.fieldValMap.delete(fieldStr);
        //eventKo
        _vccObj.currentObjData.eventKo.delete(fieldStr)
        //恢复默认 border
        let nodeBorderListMap = _vccObj.currentObjData.fieldBorderList.get(fieldStr);
        if (VccUtils.isNull(nodeBorderListMap)) {
          return;
        }
        let setStyle;
        nodeBorderListMap.forEach((nodeBorder, index) => {
          if (0 === index) {
            setStyle = _vccObj.currentObjData.fieldBorderDefaultStyle.get(fieldStr);
          }
          nodeBorder.style.border = setStyle.border;
          nodeBorder.style.outline = setStyle.outline;
        });
      },
      /**
       * 重置给定字段
       */
      resetField: function (fieldStr) {
        if (VccUtils.isEmpty(fieldStr)) {
          console.error(`VccValidate: resetField error field Name is Empty`);
          return;
        }
        //重置字段状态
        _vccObj.currentObjData.fieldStatus.set(fieldStr, []);
        //删除错误信息
        _vccObj.currentObjData.fieldError.delete(fieldStr);
        if (VccUtils.isNull(_vccObj.currentObjData.nodeBorderList)) {
          return;
        }
        //恢复默认 border
        let node = _vccObj.currentObjData.nodeBorderList.get(fieldStr);
        if (undefined === nodeBorder || null === nodeBorder) {
          return;
        }
        node.style.border = _vccObj.currentObjData.fieldBorderDefaultStyle.get(fieldStr).border;
      },
      /**
       * 更新状态
       * 更新给定字段的验证器结果
       * @param fieldStr 
       * @param status 
       * @param validatorRuleName 
       * */
      updateStatus: function (fieldStr, status, validatorRuleName) {
        if (VccUtils.isEmpty(fieldStr) || VccUtils.isEmpty(status) || VccUtils.isEmpty(validatorRuleName)) {
          console.error(`VccValidate: updateStatus error params is empty`);
          return;
        }
        let fieldStatusList = _vccObj.currentObjData.fieldStatus.get(fieldStr);
        if (VccUtils.isNull(fieldStatusList)) {
          return;
        }
        fieldStatusList.forEach(item => {
          if (validatorRuleName === item.validatorRuleName) {
            item.status = status;
          }
        });
        _vccObj.currentObjData.fieldStatus.set(fieldStr, fieldStatusList);
        _vccObj.currentObjData.fieldStatus = new Map(_vccObj.currentObjData.fieldStatus);
      },
      getValidateStatus: function (fieldStr) {
        if (VccUtils.isEmpty(fieldStr)) {
          console.error(`VccValidate: getValidateStatus error params is empty`);
          return;
        }
        let fieldStatusList = _vccObj.currentObjData.fieldStatus.get(fieldStr);
        if (1 === fieldStatusList.length) {
          return fieldStatusList[0].status;
        }
        let errorList = [];
        fieldStatusList.forEach(val => {
          if (VccUtils.isNull(val.status)) {
            return;
          }
          if ((VccValidateConfig.finalStatusType.success === val.status || VccValidateConfig.finalStatusType.no_verify === val.status)) {
            return;
          }
          if (val.status === VccValidateConfig.finalStatusType.error) {
            errorList.push(val.validatorRuleName);
          }
        });
        if (errorList.length > 0) {
          return VccValidateConfig.finalStatusType.error;
        }
        return VccValidateConfig.finalStatusType.success;
      },
      /**
       * 重新验证给定字段
       * @param fieldStr
       */
      revalidateField: function (fieldStr, verifyCallback = null) {
        if (VccUtils.isEmpty(fieldStr)) {
          console.error(`VccValidate: revalidateField error field Name is empty`);
          return;
        }
        //删除错误信息
        _vccObj.currentObjData.fieldError.delete(fieldStr);
        //取消监视 unwatch
        let unwatch = _vccObj.currentObjData.fieldUnwatch.get(fieldStr);
        unwatch();
        _vccObj.currentObjData.fieldUnwatch.delete(fieldStr);
        this.addField(fieldStr, _vccObj.currentObjData.fieldOptions.get(fieldStr), true, verifyCallback);
      },
      /**
       * 重置表格
       * 它隐藏所有错误元素和反馈图标,所有字段都标记为尚未验证
       */
      resetForm: function () {
        let _this = this;
        _vccObj.currentObjData.fieldName.forEach((val) => {
          _this.resetField(val);
        });
      },
      getMessagesOne(fieldStr, validatorRuleName = null) {
        let messages = this.getMessages(fieldStr, validatorRuleName);
        if (VccUtils.isEmpty(messages)) {
          return "";
        }
        if (Array.isArray(messages)) {
          if (messages.length > 0) {
            return messages[0];
          }
        }
        return messages;
      },
      /**获取错误消息 */
      getMessages: function (fieldStr, validatorRuleName = null) {
        let fieldError = _vccObj.currentObjData.fieldError.get(fieldStr);
        if (VccUtils.isNull(fieldError)) {
          return "";
        }
        if (VccUtils.isEmpty(validatorRuleName)) {
          return fieldError.map(item => {
            return item.message;
          });
        }
        if (VccUtils.isNotEmpty(validatorRuleName)) {
          return fieldError.filter(item => {
            if (validatorRuleName === item.validatorRuleName) {
              return item.message;
            }
          });
        }
      },
      getMessagesList: function (fieldStr = null, validatorRuleName = null) {
        if (VccUtils.isNull(fieldStr)) {
          if (0 === _vccObj.currentObjData.fieldError.size) {
            return [];
          }
          let all = [];
          _vccObj.currentObjData.fieldError.forEach((val, key) => {
            val.forEach(err => {
              let copyErr = Object.assign({}, err);
              //替换 @
              let replaceFieldStr = VccUtils.symbolReplace(key);
              copyErr['field'] = replaceFieldStr;
              all.push(copyErr);
            })
          });
          return all;
        }
        let fieldError = _vccObj.currentObjData.fieldError.get(fieldStr);
        if (VccUtils.isEmpty(validatorRuleName)) {
          return fieldError;
        }
        if (VccUtils.isNotEmpty(validatorRuleName)) {
          return fieldError.filter(item => {
            if (validatorRuleName === item.validatorRuleName) {
              return item.message;
            }
          });
        }
      },
      /**更新错误信息 */
      updateMessage: function (fieldStr, validatorRuleName, message) {
        let fieldError = _vccObj.currentObjData.fieldError.get(fieldStr);
        if (VccUtils.isNull(fieldError)) {
          return;
        }
        fieldError.forEach(item => {
          if (validatorRuleName === item.validatorRuleName) {
            item.message = message;
          }
        });
        _vccObj.currentObjData.fieldError.set(fieldStr, fieldError);
        _vccObj.currentObjData.fieldError = new Map(_vccObj.currentObjData.fieldError);
      },
      /**
       * 获取现场选项
       * @param {*} fieldStr 
       * @param {*} validatorRuleName 
       * @param {*} option 
       */
      getOptions: function (fieldStr, validatorRuleName, option) {
        if (VccUtils.isNull(validatorRuleName) && VccUtils.isNull(option)) {
          return _vccObj.currentObjData.fieldOptions.get(fieldStr);
        }
        if (VccUtils.isNull(option)) {
          return _vccObj.currentObjData.fieldOptions.get(fieldStr).validators[validatorRuleName];
        }
        return _vccObj.currentObjData.fieldOptions.get(fieldStr).validators[validatorRuleName][option];
      },
      /**
       * 更新特定验证器的选项
       * @param {*} fieldStr 
       * @param {*} validatorRuleName 
       * @param {*} option 
       * @param {*} value 
       */
      updateOption: function (fieldStr, validatorRuleName, option, value) {
        let getOption = _vccObj.currentObjData.fieldOptions.get(fieldStr);
        if (VccUtils.isNotNull(value)) {
          getOption[validatorRuleName][option] = value;
        } else if (VccUtils.isNotNull(option)) {
          getOption[validatorRuleName] = option;
        }
        _vccObj.currentObjData.fieldOptions.set(fieldStr, getOption);
        _vccObj.currentObjData.fieldOptions = new Map(_vccObj.currentObjData.fieldOptions);
      },

    }

  }
}
VccValidate.Rules = {
  extend,
  remove
};
export default VccValidate;