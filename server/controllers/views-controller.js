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
        var dataId = data.map(e => e.id);
        console.log(dataId);
        var boardsArray = [];
        // db.sequelize
        //   .query(
        //     `select u.id from Users u
        // inner join Middles m on m.userid = u.id
        // inner join Boards b on b.id = m.boardid
        // where b.id = ?;`,
        //     {
        //       replacements: [dataId[0]],
        //       type: db.Sequelize.QueryTypes.SELECT
        //     }
        //   )
        //   .then(res => console.log(res));

        // console.log(data.length);
        data.map((e, i) => {
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
                  replacements: [dataId[i]],
                  type: db.Sequelize.QueryTypes.SELECT
                }
              )
              .then(boardUsers => {
                var username = boardUsers.map(e => e.username);
                console.log(username);
                dbBoards[0].boardUsers = username;

                // res.render("workspace", {
                //   boards: dbBoards,
                //   user: req.user
                // });
                // console.log("-----");
                // console.log(boardsArray);
                console.log("-----");
                // console.log(dbBoards[0]);
                boardsArray.push(dbBoards[0]);
                // console.log(boardsArray[0]);
                // console.log("-----");
                console.log("-----");
                if (data.length === boardsArray.length) {
                  console.log("if is true");
                  res.render("workspace", {
                    boards: boardsArray,
                    user: req.user
                  });
                } else {
                  console.log("if is false");
                }
              });
          });
          // console.log("map ends");
          // console.log("last thing to happen");
        });
        // console.log("ends");

        //do an if(var.length)?
        // db.Board.findAll({
        //   where: { id: dataId },
        //   include: [{ model: db.Task }]
        // }).then(function(dbBoards) {
        //   console.log(dbBoards.length);
        //   res.render("workspace", {
        //     boards: dbBoards,
        //     user: req.user
        //   });
        // });
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
