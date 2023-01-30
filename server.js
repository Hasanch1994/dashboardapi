const http = require("http");
const express = require("express");
const app = express();
require("dotenv").config();
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwtAuth = require("./middleware/auth");
const cookieParser = require("cookie-parser");
app.use("/upload/files", express.static(process.cwd() + "/upload/profile"));
const credentials = require("./middleware/credentials");
const corsOptions = require("./config/corsOptions");
const path = require("path");

//json body
app.use(bodyParser.json());
//urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(credentials);

app.use(cookieParser());
//helmet
app.use(helmet());
app.use(cors(corsOptions));
app.get("/", (req, resp) => {
  resp.status(200).send({
    msg: "welcome to api",
  });
});

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  console.log("server is running...");
});

module.exports = app;
