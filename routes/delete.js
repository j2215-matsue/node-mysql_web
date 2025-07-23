const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

router.post('/:id', function (req, res, next) {
  const userId = req.user.id;
  const taskId = req.params.id;
  const redirect = req.query.redirect || '/'; // ← 追加

  knex("tasks")
    .where({ id: taskId, user_id: userId })
    .del()
    .then(() => res.redirect(redirect)) // ← 修正
    .catch(err => {
      console.error(err);
      res.redirect('/');
    });
});

module.exports = router;