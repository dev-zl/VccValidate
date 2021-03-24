/* eslint-disable camelcase */
import notEmpty from './notEmpty.js';
import length from './length.js';
import regexp from './regexp.js';

import isEmail from './isEmail.js';
import contains from './contains.js';
import equals from './equals.js';
import isAfter from './isAfter.js';
import isAlpha from './isAlpha.js';
import isAlphanumeric from './isAlphanumeric.js';
import isAscii from './isAscii.js';
import isBase64 from './isBase64.js';
import isBefore from './isBefore.js';
import isBoolean from './isBoolean.js';
import isFloat from './isFloat.js';
import isInt from './isInt.js';
import isURL from './isURL.js';
import isUppercase from './isUppercase.js';
import isNumeric from './isNumeric.js';
import different from './different.js';
import callback from './callback.js';
const RULES = {
  notEmpty,
  length,
  regexp,
  isEmail,
  contains,
  equals,
  isAfter,
  isAlpha,
  isAlphanumeric,
  isAscii,
  isBase64,
  isBefore,
  isBoolean,
  isFloat,
  isInt,
  isURL,
  isUppercase,
  isNumeric,
  different,
  callback
};
export function remove(ruleName) {
  delete RULES[ruleName];
}

export function extend(name, rules) {
  //module.exports[name] = rules;
  RULES[name] = rules;
}

export default RULES;