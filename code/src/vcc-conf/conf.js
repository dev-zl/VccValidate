import {
  extend
} from '../vcc-rules/index';
const CONFIG = {
  tagMapping: {},
  mappingFunction: {},
  debugLog: false,
  RULES: {}
};

export default CONFIG;

export function mappingAdd(tagName, cmd) {
  CONFIG.tagMapping[tagName] = cmd;
}

export function mappingFunctionAdd(tagName, fun) {
  CONFIG.mappingFunction[tagName] = fun;
}
export function getMappingFunction(tagName) {
  return CONFIG.mappingFunction[tagName];
}

export function mappingAddAll(vccMapping) {
  Object.keys(vccMapping).forEach(tagName => {
    CONFIG.tagMapping[tag] = vccMapping[tagName];
  });
}

export function getTagMappingCmd(tagName) {
  return CONFIG.tagMapping[tagName];
}

export function configure(configObj) {
  Object.keys(CONFIG).forEach(f => {
    let v = configObj[f];
    if (undefined !== v) {
      CONFIG[f] = configObj[f];
    }
  });
  Object.keys(CONFIG.RULES).forEach(name => {
    extend(name, CONFIG.RULES[name])
  });




}