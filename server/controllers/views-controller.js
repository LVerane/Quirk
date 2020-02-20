const express = require("express");
const router = express.Router();
var db = require("../models");

router.get("/", (req, res) => res.render("home", { user: req.user }));
router.get("/settings", (req, res) =>
  res.render("settings", { user: req.user })
);
// router.get("/register", (req, res) => res.render("home", { user: req.user }));
router.get("/register", function(req, res) {
  if (req.user) {
    res.redirect("/me");
  } else {
    res.render("home", { user: req.user });
  }
});

// -----htmlRoutes-----
router.get("/me", function(req, res) {
  if (req.user) {
    db.sequelize
      .query(
        `select b.id from Boards b
    inner join Middles m on m.boardid = b.id
    inner join Users u on u.id = m.userid
    where u.id = ?;`,
        { replacements: [req.user.id], type: db.Sequelize.QueryTypes.SELECT }
      )
      .then(data => {
        var boardsArray = [];
        data.map(e => {
          db.Board.findAll({
            where: { id: e.id },
            include: [{ model: db.Task }]
          }).then(function(dbBoards) {
            db.sequelize
              .query(
                `select u.username from Users u
        inner join Middles m on m.userid = u.id
        inner join Boards b on b.id = m.boardid
        where b.id = ?;`,
                {
                  replacements: [e.id],
                  type: db.Sequelize.QueryTypes.SELECT
                }
              )
              .then(boardUsers => {
                dbBoards[0].boardUsers = boardUsers.map(e => e.username);
                boardsArray.push(dbBoards[0]);
                if (data.length === boardsArray.length) {
                  res.render("workspace", {
                    boards: boardsArray,
                    user: req.user
                  });
                }
              });
          });
        });
      });
  } else {
    res.render("404");
  }
});

router.get("/board/:id", function(req, res) {
  db.Board.findOne({ where: { id: req.params.id } }).then(function(dbBoard) {
    res.render("board", {
      board: dbBoard
    });
  });
});

router.get("/task/:id", function(req, res) {
  db.Task.findOne({ where: { id: req.params.id } }).then(function(dbTask) {
    res.render("task", {
      task: dbTask
    });
  });
});

router.get("*", function(req, res) {
  res.render("404");
});
// -----endhtmlRoutes-----

module.exports = router;
