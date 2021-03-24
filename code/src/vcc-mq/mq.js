import VccUtils from './../vcc-utils/index';
// import VccConf from './src/vcc-conf/conf';
export default class VccMQ {

  constructor() {
    //存放订阅者信息
    this.subscribers = new Map();
  }
  //添加订阅者
  addSubscriber(key, subscriber) {
    //使用 key  保证一个订阅者只能订阅一次  
    this.subscribers.set(key, subscriber);
    return this;
  }

  //发布消息
  deliver(key) {
    let fn = this.subscribers.get(key);
    if (VccUtils.isNotNull(fn)) {
      //console.log(`消息已经发布:${key}`);
      fn(key);
      return true;
    } else {
      return false;
    }
  }
  //重新 发布消息
  // againSend() {
  //   let _this = this;
  //   this.noSuccessMessageSent.forEach(key => {
  //     _this.deliver(key);
  //   });
  // }
}