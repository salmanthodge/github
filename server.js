const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid").v4;
const user = require("./user");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());

const options = {
  origin: "*",
  methods: "GET,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(options));

app.use((req, res, next) => {
  req.headers["request_id"] = uuid();
  // console.log(req.headers);
  next();
});

app.use("/v1", user);

app.listen(3000, () => {
  console.log("Server started");
});
