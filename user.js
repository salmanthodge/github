const express = require("express");
const conn = require("./database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const saltRounds = 10;

//REGISTER
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (
      !req.body ||
      !req.body.username ||
      !req.body.email ||
      !req.body.password
    ) {
      return res.status(400).send({
        message: "bad request",
      });
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);
    queryString = `INSERT INTO users
    (username,email,password)
    values(?,?,?)`;
    const [result] = await conn
      .promise()
      .execute(queryString, [username, email, hashPassword]);
    if (result.affectedRows === 0) {
      res.status(400).send({
        message: "User not inserted",
      });
    }
    res.status(201).send({
      message: "user created succesfully",
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
    if (!email && !password) {
      res.status(400).send({
        message: "Misssing parameters",
      });
    }
    queryString = `SELECT email,password from users where email = ?`;
    const [result] = await conn.promise().execute(queryString, [email]);
    if (result.length === 0) {
      res.status(400).send({
        message: "User not found",
      });
    }

    const hashedPassword = result[0].password;
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (!passwordMatch) {
      res.status(400).send({
        message: "Incorrect password",
      });
    }
    const token = jwt.sign({ user_id: result[0].id }, "test");
    res.status(200).send({
      message: "Login Successfully",
      token,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error while login user",
      error,
    });
  }
};

//FORGOT PASSWORD
const forgotPassword = async (req, res, next) => {
  try {
    const generateRandomOTP = () => {
      // Generate a random 4-digit OTP
      return Math.floor(1000 + Math.random() * 9000);
    };
    const { email } = req.body;
    if (!email) {
      res.status(400).send({
        message: "Missing email parameter",
      });
      return;
    }

    queryString = `SELECT otp,email,password from users where email = ?`;
    const [result] = await conn.promise().execute(queryString, [email]);
    // console.log(result[0].otp);
    if (result.length === 0) {
      res.status(404).send({
        message: "Email not found",
      });
      return;
    }

    const otp = generateRandomOTP();
    queryString = `UPDATE users SET otp = ? WHERE email = ?`;
    await conn.promise().execute(queryString, [otp, email]);
    res.status(200).send({
      message: "OTP sent for password reset",
      otp,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error while login user",
      error,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).send({
        message: "Missing parameters",
      });
      return;
    }
    let queryString = `SELECT otp,email FROM users WHERE email = ?`;
    const [result] = await conn.promise().execute(queryString, [email]);
    // console.log(result[0].otp);
    // console.log(queryString);

    if (result.length === 0 || result[0].otp !== otp) {
      res.status(400).send({
        message: "Invalid OTP",
      });
    }
    const hashPassword = await bcrypt.hash(newPassword, saltRounds);
    queryString = `UPDATE users SET password = ?  WHERE email = ?`;
    await conn.promise().execute(queryString, [hashPassword, email]);
    res.status(200).send({
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Error during password reset",
      error,
    });
  }
};

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
