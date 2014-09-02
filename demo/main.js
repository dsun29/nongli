(function (Nongli) {
  'use strict';

  $(function () {
    var
      $calendar = $('.nl-calendar'),
      $selectYear = $('.select-year'),
      $selectMonth = $('.select-month'),
      today = new Nongli.Date(),
      thisYear = today.year(),
      thisMonth = today.month(),
      calendar = new Nongli.Calendar(thisYear, thisMonth),
      yearOptions = [],
      monthOptions = [],
      i;

    $calendar.html(calendar.renderHTML());

    // 選擇年

    for (i = Nongli.START_YEAR; i < Nongli.END_YEAR; i++) {
      yearOptions.push('<option value="' + i +
          (i === thisYear ? '" selected>' : '">') +
          i + '</option>');
    }

    $selectYear
      .append(yearOptions)
      .on('change', function () {
        calendar.year($(this).val());
        $calendar.html(calendar.renderHTML());
      });

    // 選擇月

    for (i = 1; i <= 12; i++) {
      monthOptions.push('<option value="' + i +
          (i === thisMonth ? '" selected>' : '">') +
          i + '</option>');
    }

    $selectMonth
      .append(monthOptions)
      .on('change', function () {
        calendar.month($(this).val());
        $calendar.html(calendar.renderHTML());
      });


    // 上一年
    $('.previous-year').on('click', function () {
      calendar.gotoPreviousYear();
      $selectYear.val(calendar.year());
      $calendar.html(calendar.renderHTML());
    });

    // 下一年
    $('.next-year').on('click', function () {
      calendar.gotoNextYear();
      $selectYear.val(calendar.year());
      $calendar.html(calendar.renderHTML());
    });

    // 上個月
    $('.previous-month').on('click', function () {
      calendar.gotoPreviousMonth();
      $selectYear.val(calendar.year());
      $selectMonth.val(calendar.month());
      $calendar.html(calendar.renderHTML());
    });

    // 下個月
    $('.next-month').on('click', function () {
      calendar.gotoNextMonth();
      $selectYear.val(calendar.year());
      $selectMonth.val(calendar.month());
      $calendar.html(calendar.renderHTML());
    });

    // 回到今天
    $('.today').on('click', function () {
      today = new Nongli.Date();
      calendar = new Nongli.Calendar(today.year(), today.month());
      $selectYear.val(calendar.year());
      $selectMonth.val(calendar.month());
      $calendar.html(calendar.renderHTML());
    });
  });
}(Nongli));

