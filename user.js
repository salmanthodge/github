const express = require("express");
const conn = require("./database");

const router = express.Router();

//REGISTER
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    queryString = `INSERT INTO users
    (username,email,password)
    values(?,?,?)`;
    const [result] = await conn
      .promise()
      .execute(queryString, [username, email, password]);
    res.status(200).send({
      message: "user registered succesfully",
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error while creating user",
      error,
    });
  }
};

//LOGIN
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    queryString = `SELECT email,password from users where email = ? and password = ?`;
    const [result] = await conn
      .promise()
      .execute(queryString, [email, password]);
    res.status(200).send({
      message: "user Login succesfully",
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error while login user",
      error,
    });
  }
};

router.post("/register", register);
router.post("/login", login);

module.exports = router;
