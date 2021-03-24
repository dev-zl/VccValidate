/* eslint-disable camelcase */
import notEmpty from './notEmpty';
import length from './length';
import regexp from './regexp';

import isEmail from './isEmail';
import contains from './contains';
import equals from './equals';
import isAfter from './isAfter';
import isAlpha from './isAlpha';
import isAlphanumeric from './isAlphanumeric';
import isAscii from './isAscii';
import isBase64 from './isBase64';
import isBefore from './isBefore';
import isBoolean from './isBoolean';
import isFloat from './isFloat';
import isInt from './isInt';
import isURL from './isURL';
import isUppercase from './isUppercase';
import isNumeric from './isNumeric';
import different from './different';
import callback from './callback';
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