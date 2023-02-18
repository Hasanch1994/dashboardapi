const http = require("http");
const express = require("express");
const app = express();
require("dotenv").config();
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
app.use("/upload/profile", express.static(process.cwd() + "/upload/profile"));
app.use(
  "/upload/portfolio",
  express.static(process.cwd() + "/upload/portfolio")
);
const credentials = require("./middleware/credentials");
const corsOptions = require("./config/corsOptions");

//urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//json body
app.use(bodyParser.json());
app.use(credentials);

app.use(cookieParser());
//helmet
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));

app.get("/", (req, resp) => {
  resp.status(200).send({
    msg: "welcome to api",
  });
});

// app.all("*", (req, res) => {
//   res.status(404);
//   if (req.accepts("html")) {
//     res.sendFile(path.join(__dirname, "views", "404.html"));
//   } else if (req.accepts("json")) {
//     res.json({ error: "404 Not Found" });
//   } else {
//     res.type("txt").send("404 Not Found");
//   }
// });

// create operator route
const operatorRoute = require("./routes/operatorRoute");
app.use("/user", operatorRoute);

// create actions route
const actionRoute = require("./routes/actionRoute");
app.use("/action", actionRoute);

const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  console.log(`server is running on Port ${process.env.PORT}`);
});

module.exports = app;
