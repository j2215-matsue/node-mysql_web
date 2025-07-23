const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

router.get('/:id', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (!isAuth) return res.redirect('/signin');

  const userId = req.user.id;
  const taskId = req.params.id;
  const redirectTo = req.query.redirect || '/'; // ← 追加

  knex("tasks")
    .where({ id: taskId, user_id: userId })
    .first()
    .then(task => {
      if (!task) return res.redirect('/');
      res.render('edit', {
        title: 'タスク編集',
        isAuth: true,
        task,
        redirectTo, // ← 追加
      });
    })
    .catch(err => {
      console.error(err);
      res.redirect('/');
    });
});

router.post('/:id', function (req, res, next) {
  const isAuth = req.isAuthenticated();
  if (!isAuth) return res.redirect('/signin');

  const userId = req.user.id;
  const taskId = req.params.id;
  const { content, date, redirect } = req.body;

  knex("tasks")
    .where({ id: taskId, user_id: userId })
    .update({
      content: content,
      date: date || null,
    })
    .then(() => res.redirect(redirect || '/')) // ← 修正
    .catch(err => {
      console.error(err);
      res.redirect('/');
    });
});

module.exports = router;