// 1970年 節氣 (solar term)

var BASE_SOLAR_TERMS = [            // 節氣 中氣
  new Date(1970,  0,  6,  2,  2),   // 小寒
  new Date(1970,  0, 20, 19, 24),   //      大寒
  new Date(1970,  1,  4, 13, 46),   // 立春
  new Date(1970,  1, 19,  9, 42),   //      雨水
  new Date(1970,  2,  6,  7, 59),   // 驚蟄
  new Date(1970,  2, 21,  8, 56),   //      春分
  new Date(1970,  3,  5, 13,  2),   // 清明
  new Date(1970,  3, 20, 20, 15),   //      穀雨
  new Date(1970,  4,  6,  6, 34),   // 立夏
  new Date(1970,  4, 21, 19, 38),   //      小滿
  new Date(1970,  5,  6, 10, 52),   // 芒種
  new Date(1970,  5, 22,  3, 43),   //      夏至
  new Date(1970,  6,  7, 21, 11),   // 小暑
  new Date(1970,  6, 23, 14, 37),   //      大暑
  new Date(1970,  7,  8,  6, 54),   // 立秋
  new Date(1970,  7, 23, 21, 34),   //      處暑
  new Date(1970,  8,  8,  9, 38),   // 白露
  new Date(1970,  8, 23, 18, 59),   //      秋分
  new Date(1970,  9,  9,  1,  2),   // 寒露
  new Date(1970,  9, 24,  4,  4),   //      霜降
  new Date(1970, 10,  8,  3, 58),   // 立冬
  new Date(1970, 10, 23,  1, 25),   //      小雪
  new Date(1970, 11,  7, 20, 38),   // 大雪
  new Date(1970, 11, 22, 14, 36)    //      冬至
];

BASE_SOLAR_TERMS.forEach(function (date) {
  console.log(date, date/60000);
});

var
  MILLISECOND_A_DAY = 24 * 3600 * 1000,
  TROPICAL_YEAR = 365.2421897 * MILLISECOND_A_DAY;

console.log(TROPICAL_YEAR);

function solarTerm(year) {
  var offset = (year - 1970) * TROPICAL_YEAR;
  return BASE_SOLAR_TERMS.map(function (date) {
    return new Date(+date + offset);
  });
}

console.log(solarTerm(2014));

