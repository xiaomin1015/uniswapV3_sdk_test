"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toReadableAmount = exports.fromReadableAmount = void 0;
const jsbi_1 = __importDefault(require("jsbi"));
function fromReadableAmount(amount, decimals) {
    const extraDigits = Math.pow(10, countDecimals(amount));
    const adjustedAmount = amount * extraDigits;
    return jsbi_1.default.divide(jsbi_1.default.multiply(jsbi_1.default.BigInt(adjustedAmount), jsbi_1.default.exponentiate(jsbi_1.default.BigInt(10), jsbi_1.default.BigInt(decimals))), jsbi_1.default.BigInt(extraDigits));
}
exports.fromReadableAmount = fromReadableAmount;
function toReadableAmount(rawAmount, decimals) {
    return jsbi_1.default.divide(jsbi_1.default.BigInt(rawAmount), jsbi_1.default.exponentiate(jsbi_1.default.BigInt(10), jsbi_1.default.BigInt(decimals))).toString();
}
exports.toReadableAmount = toReadableAmount;
function countDecimals(x) {
    if (Math.floor(x) === x) {
        return 0;
    }
    return x.toString().split('.')[1].length || 0;
}
