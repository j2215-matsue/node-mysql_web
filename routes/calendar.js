const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

function getMonthCalendar(year, month) {
  const weeks = [];
  const firstDay = new Date(year, month - 1, 1);
  const startDay = new Date(firstDay);
  startDay.setDate(firstDay.getDate() - firstDay.getDay()); // 前の月から始める

  for (let week = 0; week < 6; week++) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(startDay);
      current.setDate(startDay.getDate() + week * 7 + i);

      // 今月以外は日付なし扱い
      if (current.getMonth() + 1 !== month) {
        days.push({ date: null });
      } else {
        days.push({
          date: current,
          isToday:
            current.toDateString() === new Date().toDateString(),
        });
      }
    }
    weeks.push(days);
  }
  return weeks;
}

router.get('/', function (req, res, next) {
  const isAuth = req.isAuthenticated?.();
  if (!isAuth) return res.redirect('/signin');

  const userId = req.user.id;

  const currentDate = new Date();
  const year = parseInt(req.query.year) || currentDate.getFullYear();
  const month = parseInt(req.query.month) || currentDate.getMonth() + 1;

  knex("tasks")
    .select("*")
    .where({ user_id: userId })
    .then(results => {
      const calendar = {};
      results.forEach(task => {
        const date = (task.date instanceof Date && !isNaN(task.date))
          ? task.date.toISOString().slice(0, 10)
          : '未設定';
        if (!calendar[date]) calendar[date] = [];
        calendar[date].push(task);
      });

      const weeks = getMonthCalendar(year, month);
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;

      res.render('calendar', {
        title: 'カレンダー',
        isAuth,
        calendar,
        weeks,
        currentYear: year,
        currentMonth: month,
        nextMonth,
        nextYear,
        prevMonth,
        prevYear,
      });
    })
    .catch(err => {
      console.error(err);
      res.render('calendar', {
        title: 'カレンダー',
        isAuth,
        calendar: {},
        weeks: [],
        errorMessage: [err.sqlMessage],
        currentYear: year,
        currentMonth: month,
        nextMonth: month + 1,
        nextYear: year,
        prevMonth: month - 1,
        prevYear: year,
      });
    });
});

module.exports = router;