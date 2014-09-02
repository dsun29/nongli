/**
 * 讀取原始陰曆資料，檔案: lunar-data.txt
 * 轉換為編碼後的陰曆資料，存為: lunar-data.json
 */

'use strict';

var fs = require('fs');

var CHINESE_MONTHS =  ['一','二','三','四','五','六','七','八','九','十','冬','臘'];

var totalLeapMonths = 0,
  totalMonths = 0;

/**
 * 擷取註解裡面的閏月資訊
 * @param  {string} comment 每筆資料後面的註解
 * @return {number}         閏幾月 (1~12)
 */
function getLeapMonth(comment) {
  var result = 0;
  CHINESE_MONTHS.forEach(function (month, i) {
    if (comment && comment.indexOf('閏' + month) >= 0) {
      result = i + 1;
      totalLeapMonths++;
    }
  });
  return result;
}


/**
 * 1800~2100年的陰曆編碼資料，陣列中的每一個元素代表一年
 *
 * 要保存一年的資料，需要兩個資料:
 *
 * 1) 這一年陰曆每個月的大小;
 * 2) 這一年是否有閏月，閏幾月以及閏月的大小。
 *
 * 用一個整數來保存這些資料即可，具體的方法是:
 * 用一個位元來表示一個月的大小，大月記為 1，小月記為 0，
 * 這樣就用掉 12 位元 (無閏月) 或 13 位元 (有閏月)，
 * 再用高四位來表示閏月的月份，沒有閏月為0。
 *
 *  19 18 17 16 15 14 13 12 11 10  9  8  7  6  5  4  3  2  1  0
 * +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
 * |  |  |  |  |--|--|--|  |  |  |  |  |  |  |  |  |  |  |  |  |
 * +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
 *  \         /          \                                    /
 *      閏月                      大月記為 1，小月記為 0
 *    0: 無閏月              1  2  3 ....                    12 月
 * 1~12: 閏幾月           1  2  3 ....                       12 月
 *
 * 例如:
 * - 2000年的 1、2、5、8、10、11月大，其餘月份小
 *   其編碼資料二進位是 1100 1001 0110，以十六進位表示為 0xc96
 * - 2001年的 1、2、4、5、8、10、12月大，其餘月份小，閏 4 月小
 *   其編碼資料二進位是 1 1010 1001 0101 (因為閏月，所以有13位)
 *   以十六進位表示為 0x1a95
 *   加上閏幾月資料，得結果為: 0x40000 + 0x1a95 = 0x41a95
 *
 * @type {Array}
 */
function makeData(year) {
  var
    tmp = year.split('//'),
    lunarData = tmp[0].split(','),  // [1,0,1,1,...]
    comment = tmp[1],
    result = 0;

  lunarData.forEach(function (monthFlag) {
    if (monthFlag === '0' || monthFlag === '1') {
      result <<= 1;
      result += +monthFlag;
      totalMonths++;
    }
  });
  result += getLeapMonth(comment) << 16;
  return result;
}


fs.readFile('lunar-data.txt', 'utf8', function (err, data) {
  if (err) throw err;

  var
    lines = data.split('\n'),
    years = [],
    lunarData = [];

  // 每行以 1 或 0 開頭的為陰曆年資料，其他的忽略
  years = lines.filter(function (line) {
    var firstChar = line.charAt(0);
    return firstChar === '0' || firstChar === '1';
  });

  years.forEach(function (year, i) {
    lunarData.push(makeData(year));
  });

  fs.writeFile('lunar-data.json', JSON.stringify(lunarData), function (err) {
    if (err) throw err;
    console.log('已儲存lunar-data.json，總共' + lunarData.length + '年 ' +
                totalMonths + '個月 ' + totalLeapMonths + '個閏月');
  });
});
