/* nongli.js */


(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Nongli = factory();
  }
}(this, function () {
  'use strict';

  var
    GAN         = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
    ZHI         = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'],
    SIGNS       = ['鼠','牛','虎','兔','龍','蛇','馬','羊','猴','雞','狗','豬'],
    NUMBERS_ZH  = ['一','二','三','四','五','六','七','八','九','十'],
    MONTHS_ZH   = ['', '正','二','三','四','五','六','七','八','九','十','十一','十二'],
    DAYS_ZH     = ['日','一','二','三','四','五','六'],
    MILLISECONDS_A_DAY = 86400000,   //  24 * 3600 * 1000

    START_YEAR = 1800,
    START_TIME = +new Date(START_YEAR, 0, 25),  //  1800/1/25 為農曆新年

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
    LUNAR_CODE = [
      267946,1717,698,135862,2359,395822,3350,3659,331090,3497,1461,197997,686,2606,137773,3221,400021,2898,2921,264922,1373,605,201819,2603,464171,2709,2890,333482,2773,1371,263351,599,592471,1323,1685,396693,1450,2741,264813,1198,2647,199253,3370,466218,3413,1450,333146,2397,1198,267435,2637,531050,2857,2901,461525,730,2397,330071,1179,2635,202315,1705,529833,1717,694,332470,2359,1175,265366,3658,662858,3497,1453,394605,686,2350,334125,3221,3402,203594,2921,461530,1371,605,332379,2347,2709,268949,2890,2901,133813,1371,394423,599,1323,333098,3733,1706,202154,2741,526701,1198,2647,330317,3366,3477,265557,1386,2477,133469,1198,398491,2637,3365,334501,2900,3434,135898,2395,461111,1175,2635,333387,1701,1748,267701,694,2391,133423,1175,396438,3402,3749,331177,1453,694,201326,2350,465197,3221,3402,400202,2901,1386,267611,605,2349,137515,2709,464533,1738,2901,330421,1242,2651,199255,1323,529706,3733,1706,398762,2741,1206,267438,2647,1318,204070,3477,461653,1386,2413,330077,1197,2637,268877,3365,531109,2900,2922,398042,2395,1179,267415,2635,661067,1701,1748,398772,2742,2391,330031,1175,1611,200010,3749,527717,1452,2742,332397,2350,3222,268949,3402,3493,133973,1386,464219,605,2349,334123,2709,2890,267946,2773,592565,1210,2651,395863,1323,2707,265877,1706,2773,133557,1206,398510,2638,3366,335142,3411,1450,200042,2413,723293,1197,2637,399947,3365,3410,334676,2906,1389,133467,1179,464023,2635,2725,333477,1746,2778,199350,2359,526639,1175,1611,396618,3749,1706,267628,2734,2350,203054,3222,465557,3402,3493,330581,1386,2669,264797,1325,529707,2709,2890,399018,2773,1370,267450,2651,1323,202023,1683,462419,1706,2773,330165,1206,2647,264782,3350,531750,3410,3498,396650,1389,1198,267421,2605,3349,138021,3410
    ];

  /**
   * 解碼陰曆資料
   * @param  {number} code LUNAR_CODE中的任一個編碼元素
   * @return {Object}      陰曆資料
   */
  function decode(code) {
    var
      leapMonth = code >> 16,
      totalMonths = leapMonth ? 13 : 12,
      daysOfMonths = [],
      totalDays = 0,
      daysOfMonth,
      i;

    for (i = 0; i < totalMonths; i++) {
      daysOfMonth = code % 2 === 1 ? 30 : 29;
      daysOfMonths.unshift(daysOfMonth);
      totalDays += daysOfMonth;
      code >>= 1;
    }

    return {
      daysOfMonths: daysOfMonths,   // e.g. [30, 29, 30, 30, 29, ..., 30]
      leapMonth: leapMonth,         // 0: 無閏月 1~12 閏一 ~ 閏十二月
      totalDays: totalDays          // 這年的總天數
    };
  }

  /**
   * 陰曆資料
   * @type {Object}
   */
  var LUNAR_DATA = (function () {
   var
      newYear = START_TIME,
      lunarData = {};

    each(LUNAR_CODE, function (code, i) {
      var data = lunarData[START_YEAR + i] = decode(code);
      data.newYear = newYear;
      newYear += data.totalDays * MILLISECONDS_A_DAY;
    });

    return lunarData;
  }());


  function each(arr, func) {
    var len = arr.length, i;
    for (i = 0; i < len; i++) func(arr[i], i);
  }

  function map(arr, func) {
    var result = [];
    each(arr, function (val, i) { result.push(func(val, i)); });
    return result;
  }

  function extend(target, ext) {
    for (var prop in ext) { target[prop] = ext[prop]; }
    return target;
  }

  // Triangle of hackery
  function applyConstructor(C, a) {
    switch (a.length) {
    case 0:
      return new C();
    case 1:
      return new C(a[0]);
    case 2:
      return new C(a[0], a[1]);
    case 3:
      return new C(a[0], a[1], a[2]);
    case 4:
      return new C(a[0], a[1], a[2], a[3]);
    case 5:
      return new C(a[0], a[1], a[2], a[3], a[4]);
    case 6:
      return new C(a[0], a[1], a[2], a[3], a[4], a[5]);
    case 7:
      return new C(a[0], a[1], a[2], a[3], a[4], a[5], a[6]);
    }
  }

  var synthesize = (function () {

    // var _id = 0, property = {};

    // function id() { return '_' + id++; }


    // function makeBasicProperty() {
    //   var _varName = id();
    //   return function (val) {
    //     if (arguments.length === 0) return this[_varName];
    //     this[_varName] = val;
    //     return this;
    //   };
    // }

    function makeCustomProperty(get, set) {
      return function (val) {
        if (arguments.length === 0) return get.call(this);
        set.call(this, val);
        return this;
      };
    }

    function makeReadOnlyProperty(get) {
      return function () {
        if (arguments.length === 0) return get.call(this);
        throw new Error('Write to readonly property');
      };
    }

    function synthesize(def) {
      // if (arguments.length === 0) return makeBasicProperty();
      if (def.get && def.set)     return makeCustomProperty(def.get, def.set);
      if (def.get)                return makeReadOnlyProperty(def.get);
      throw new Error('Invalid definition');
    }

    return synthesize;
  }());


  function NDate() {
    var year = arguments[0];
    if (arguments.length > 1) arguments[1] -= 1;
    this._date = applyConstructor(Date, arguments);
    if (year < 100 && year >= 0) this.year(year);
    this._compute();
  }

  extend(NDate.prototype, {
    // 本地時間
    year: synthesize({
      get: function () { return this._date.getFullYear(); },
      set: function (y) { this._date.setFullYear(y); this._compute(); }
    }),
    month: synthesize({
      get: function () { return this._date.getMonth() + 1; },
      set: function (m) { this._date.setMonth(m - 1); this._compute(); }
    }),
    date: synthesize({
      get: function () { return this._date.getDate(); },
      set: function (d) { this._date.setDate(d); this._compute(); }
    }),
    day: synthesize({
      get: function () { return this._date.getDay(); }
    }),

    /**
     * 取得以中文表示的星期
     * @return {string}   星期 (日, 一, ..., 六)
     */
    day_zh: synthesize({
      get: function () { return DAYS_ZH[this.day()]; }
    }),

    hours: synthesize({
      get: function () { return this._date.getHours(); },
      set: function (h) { this._date.setHours(h); this._compute(); }
    }),
    minutes: synthesize({
      get: function () { return this._date.getMinutes(); },
      set: function (m) { this._date.setMinutes(m); this._compute(); }
    }),
    seconds: synthesize({
      get: function () { return this._date.getSeconds(); },
      set: function (s) { this._date.setSeconds(s); this._compute(); }
    }),
    milliseconds: synthesize({
      get: function () { return this._date.getMilliseconds(); },
      set: function (ms) { this._date.setMilliseconds(ms); this._compute(); }
    }),

    // UTC 世界協調時間
    utcYear: synthesize({
      get: function () { return this._date.getUTCFullYear(); },
      set: function (y) { this._date.setUTCFullYear(y); this._compute(); }
    }),
    utcMonth: synthesize({
      get: function () { return this._date.getUTCMonth() + 1; },
      set: function (m) { this._date.setUTCMonth(m - 1); this._compute(); }
    }),
    utcDate: synthesize({
      get: function () { return this._date.getUTCDate(); },
      set: function (d) { this._date.setUTCDate(d); this._compute(); }
    }),
    utcDay: synthesize({
      get: function () { return this._date.getUTCDay(); }
    }),
    utcHours: synthesize({
      get: function () { return this._date.getUTCHours(); },
      set: function (h) { this._date.setUTCHours(h); this._compute(); }
    }),
    utcMinutes: synthesize({
      get: function () { return this._date.getUTCMinutes(); },
      set: function (m) { this._date.setUTCMinutes(m); this._compute(); }
    }),
    utcSeconds: synthesize({
      get: function () { return this._date.getUTCSeconds(); },
      set: function (s) { this._date.setUTCSeconds(s); this._compute(); }
    }),
    utcMilliseconds: synthesize({
      get: function () { return this._date.getUTCMilliseconds(); },
      set: function (ms) { this._date.setUTCMilliseconds(ms); this._compute(); }
    }),

    // 陰曆

    /**
     * 取得以西元數值表示的陰曆年
     * @return {number} 陰曆年 (1800~2100)
     */
    lunarYear: synthesize({
      get: function () { return this._lyear; }
    }),

    /**
     * 取得以數值表示的陰曆月份
     * @return {number} 陰曆月 (0~11, 閏月為負值)
     */
    lunarMonth: synthesize({
      get: function () { return this._lmonth; }
    }),

    /**
     * 這天的月份是否為閏月
     * @return {Boolean} 是否為閏月
     */
    isLeapMonth: synthesize({
      get: function () { return this._isLeapMonth; }
    }),

    /**
     * 取得以數值表示的年干
     * @return {number} 年干 (0~9)
     */
    lunarYearGan: synthesize({
      get: function () { return (this.lunarYear() - 4) % 10; }
    }),

    /**
     * 取得以數值表示的陰曆年年支
     * @return {number} 年支 (0~11)
     */
    lunarYearZhi: synthesize({
      get: function () { return (this.lunarYear() - 4) % 12; }
    }),

    /**
     * 取得陰曆年的年干
     * @return {string} 年干 (甲, 乙, ..., 癸)
     */
    lunarYearGan_zh: synthesize({
      get: function () { return GAN[this.lunarYearGan()]; }
    }),

    /**
     * 取得陰曆年的年支
     * @return {string} 年支 (子, 丑, ..., 亥)
     */
    lunarYearZhi_zh: synthesize({
      get: function () { return ZHI[this.lunarYearZhi()]; }
    }),

    lunarYearGanZhi_zh: synthesize({
      get: function () { return this.lunarYearGan_zh() + this.lunarYearZhi_zh(); }
    }),

    /**
     * 取得陰曆年的生肖
     * @return {string} 生肖 (鼠, 牛, ..., 豬)
     */
    lunarYearSign_zh: synthesize({
      get: function () { return SIGNS[this.lunarYearZhi()]; }
    }),

    /**
     * 取得以中文表示的陰曆月份
     * @return {string} 陰曆月 (正, 二, 三, ..., 十二)
     */
    lunarMonth_zh: synthesize({
      get: function () {
        return (this.isLeapMonth() ? '閏' : '') + MONTHS_ZH[this.lunarMonth()];
      }
    }),


    /**
     * 取得以數值表示的陰曆日期
     * @return {number} 陰曆日期 (1~30)
     */
    lunarDate: synthesize({
      get: function () { return this._ldate; }
    }),

    /**
     * 取得以中文表示的陰曆日期
     * @param {number}  date 陰曆日期
     * @return {string} 陰曆日期 (初一, ..., 初十, 十一, ..., 十九, 廿, 廿九, 三十)
     */
    lunarDate_zh: synthesize({
      get: function (date) {
        var
          d = this.lunarDate(),
          str = d < 11 ? '初' :
                d < 20 ? '十' :
                d < 30 ? '廿' : '三十';

        return d === 20 || d === 30 ? str : str + NUMBERS_ZH[(d - 1) % 10];
      }
    }),

    lunarCalendarDate_zh: synthesize({
      get: function () {
        return this.lunarDate() === 1 ? this.lunarMonth_zh() + '月' :
                                        this.lunarDate_zh();
      }
    }),

    time: synthesize({
      get: function () { return this._date.getTime(); },
      set: function (t) { this._date.setTime(t); }
    }),

    timezoneOffset: synthesize({
      get: function () { return getTimezoneOffset(); }
    }),

    // valueOf: function () { return this._date.valueOf(); },

    toString: function () {
      var d = this;
      return '公元' + d.year() + '年' + d.month() + '月' + d.date() + '日 ' +
             d.lunarYearGanZhi_zh() + '(' + d.lunarYearSign_zh() + ')年 ' +
             d.lunarMonth_zh() + '月 ' + d.lunarDate_zh() +
             '日 (星期' + d.day_zh() + ')';
    },

    // 由陽曆日期，計算陰曆日期
    _compute: function () {
      var
        lyear = this.year(),
        lmonth = 0,
        lunarData,
        ldate,
        daysOfMonths,
        leapMonth,
        isLeapMonth = false,
        result;

      // 已過了陽曆年，但尚未過陰曆年
      if (this.time() < LUNAR_DATA[lyear].newYear) { lyear -= 1; }

      lunarData = LUNAR_DATA[lyear];
      ldate = Math.floor((this._date -lunarData.newYear) / MILLISECONDS_A_DAY) + 1;
      daysOfMonths = lunarData.daysOfMonths;
      leapMonth = lunarData.leapMonth;

      while (ldate - daysOfMonths[lmonth] > 0) {
        ldate -= daysOfMonths[lmonth];
        lmonth++;
      }

      if (leapMonth) {
        if (lmonth === leapMonth) isLeapMonth = true;
        if (lmonth < leapMonth)   lmonth++;
      } else {
        lmonth++;
      }

      this._lyear = lyear;
      this._lmonth = lmonth;
      this._ldate = ldate;
      this._isLeapMonth = isLeapMonth;
    }
  });


  /**
   * 由陰曆日期創建日期物件
   * @param {number}  year        陰曆年 (1800~2100)
   * @param {number}  month       陰曆月 (1~12)
   * @param {number}  date        陰曆日 大月(1~30) 小月(1~29)
   * @param {Boolean} isLeapMonth 是否為閏月
   */
  NDate.fromLunarDate = function (lyear, lmonth, ldate, isLeapMonth) {
    var
      lunarData = LUNAR_DATA[lyear],
      leapMonth = lunarData.leapMonth,
      monthIndex = lmonth - 1,
      dayOffset = 0,
      i;

    if (!lunarData) { throw new RangeError('超過年的範圍'); }
    if (lmonth < 1 || lmonth > 12) { throw new RangeError('超過月的範圍'); }
    if (isLeapMonth && lmonth !== leapMonth) { throw new Error('本月無閏'); }

    // 閏月及之後的月份，索引值加一
    if ((leapMonth && lmonth > leapMonth) || isLeapMonth) { monthIndex++; }
    if (ldate < 1 || ldate > lunarData[monthIndex]) { throw new RangeError('超過日的範圍'); }

    for (i = 0; i < monthIndex; i++) {
      dayOffset += lunarData.daysOfMonths[i];
    }

    return new NDate(lunarData.newYear + (dayOffset + ldate - 1) * MILLISECONDS_A_DAY);
  }


  function Calendar(year, month) {
    this.init(year, month);
  }

  extend(Calendar.prototype, {

    init: function (year, month) {
      var
        rows = [],
        firstDay = new NDate(year, month, 1),
        lastDay = new NDate(year, month + 1, 0),
        base,
        numRows, i, j;

      month = firstDay.month();
      year = firstDay.year();

      firstDay.date(firstDay.date() - firstDay.day());
      lastDay.date(lastDay.date() + 6 - lastDay.day());

      base = firstDay.time();
      numRows = ((lastDay.time() - firstDay.time()) / MILLISECONDS_A_DAY + 1) / 7;

      for (j = 0; j < numRows; j++) {
        rows[j] = [];
        for (i = 0; i < 7; i++) {
          rows[j][i] = new NDate((i + j * 7) * MILLISECONDS_A_DAY + base);
        }
      }

      this._year = year;
      this._month = month;
      this._rows = rows;
    },

    year: synthesize({
      get: function () { return this._year; },
      set: function (year) { this.init(year, this._month); }
    }),
    month: synthesize({
      get: function () { return this._month; },
      set: function (month) { this.init(this._year, month); }
    }),

    rows: synthesize({
      get: function () { return this._rows; },
    }),

    eachRow: function (func) { each(this._rows, func); },

    mapRow: function (func) { return map(this._rows, func); },

    gotoPreviousYear: function () { this.year(this.year() - 1); },

    gotoNextYear: function () { this.year(this.year() + 1); },

    gotoPreviousMonth: function () { this.month(this.month() - 1); },

    gotoNextMonth: function () { this.month(this.month() + 1); },

    renderHTML: function () {
      var
        year = this.year(),
        month = this.month(),
        today = new NDate(),
        yearToday = today.year(),
        monthToday = today.month(),
        dateToday = today.date(),
        firstDayOfTheMonth = new NDate(year, month),
        strings = [
          '<thead><tr><th class="nl-title" colspan="7">西元 ',
          year,
          ' 年 ',
          month,
          ' 月 &nbsp;歲次',
          firstDayOfTheMonth.lunarYearGanZhi_zh(),
          ' ',
          firstDayOfTheMonth.lunarYearSign_zh(),
          '年<th></tr><tr class="nl-weekdays">'
        ];

      function isToday(date) {
        return date.date() === dateToday &&
               date.month() === monthToday &&
               date.year() === yearToday;
      }

      function addCell(date) {
        strings.push(
          date.month() === month ?
              (isToday(date) ? '<td class="nl-today">' : '<td>') :
              (isToday(date) ? '<td class="nl-today nl-other-month">' :
                                 '<td class="nl-other-month">'),
          '<span class="nl-solar-date">',
          date.date(), '</span><br>',
          date.lunarDate() === 1 ? '<span class="nl-first-lunar-day">' : '</span>',
          date.lunarCalendarDate_zh(),
          '</span></td>'
        );
      }

      each(DAYS_ZH, function (day) {
        strings.push('<th>', day, '</th>');
      });

      strings.push('</tr></thead>\n<tbody>');

      this.eachRow(function (row) {
        strings.push('<tr>');
        each(row, addCell);
        strings.push('</tr>');
      });

      strings.push('</tbody>');
      return strings.join('');
    },

    toString: function () {
      return '   ' + this.year() + ' 年 ' + this.month() + ' 月\n' +
        DAYS_ZH.join(' ') + '\n' +
        this.mapRow(function (row) {
          return map(row, function (day) {
            var date = day.date();
            return (date < 10 ? ' ' : '') + date;
          }).join(' ');
        }).join('\n');
    }
  });

  return {
    MONTHS_ZH: MONTHS_ZH,
    DAYS_ZH: DAYS_ZH,
    MILLISECONDS_A_DAY: MILLISECONDS_A_DAY,
    START_YEAR: START_YEAR,
    END_YEAR: START_YEAR + LUNAR_CODE.length,
    Date: NDate,
    Calendar: Calendar,
    each: each,
    map: map
  };
}));

