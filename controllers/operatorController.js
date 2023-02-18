const { eLog } = require("../helper/createLog");
const { invalidParams } = require("../helper/errors");
const GenerateToken = require("../utils/generateToken");

const { client, db, closeConnection } = require("../config/db");
const { opDB } = require("../helper/collectionNames");
const { ObjectID } = require("bson");
// method for login user and generate token
exports.loginOperator = async (req, resp) => {
  try {
    const { userName, password } = req.body;
    if (!userName && !password) resp.status(400).send({ msg: invalidParams });

    // get cookies from request
    const cookies = req.cookies;
    // check operator is exist

    await client.connect();
    await db
      .collection(opDB)
      .find({ opName: userName, password: password })
      .toArray()
      .then(async (result) => {
        if (result && result.length > 0) {
          const operator = result[0];
          // create object of GenerateToken class
          const gToken = new GenerateToken();

          const _accessToken = await gToken.accessToken(
            operator._id,
            operator.opName
          );

          const _refreshToken = await gToken.refreshToken(operator._id);

          let newRefreshTokenArray = !cookies.rToken
            ? operator.refreshToken
            : _refreshToken;

          if (cookies.rToken) {
            const refreshToken = cookies.rToken;

            const foundToken = await db
              .collection(opDB)
              .find({ refreshToken: refreshToken.refreshToken })
              .toArray();

            // Detected refresh token reuse!
            if (!foundToken && foundToken.length === 0) {
              // clear out ALL previous refresh tokens
              newRefreshTokenArray = "";
            }

            resp.clearCookie("rToken", {
              httpOnly: true,
              sameSite: "None",
              secure: true,
            });
          }

          // Saving refreshToken with current user
          await db
            .collection(opDB)
            .updateOne(
              { _id: operator._id },
              { $set: { refreshToken: _refreshToken.refreshToken } }
            );

          // Creates Secure Cookie with refresh token
          resp.cookie("rToken", _refreshToken.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000 * 30,
          });

          // Send access token to user
          resp.json({
            _accessToken,
            operatorInfo: {
              opId: operator._id,
              opName: operator.opName,
            },
          });
        } else {
          resp
            .status(200)
            .send({ msg: "this userName and password is Not Exists" });
        }
      })
      .catch((err) => {
        eLog(err);
      })
      .finally(() => {
        // close connection
        // closeConnection();
      });
  } catch (err) {
    eLog(err);
  }
};

// method for logout and clear token
exports.handleLogout = async (req, res) => {
  // On client, also delete the accessToken
  const cookies = req.cookies;
  if (!cookies?.rToken) return res.sendStatus(204); //No content
  const refreshToken = cookies.rToken;

  // Is refreshToken in db?

  await client.connect();
  const foundUser = await db
    .collection("operators")
    .find({ refreshToken: refreshToken })
    .toArray();

  if (!foundUser || foundUser.length === 0) {
    res.clearCookie("rToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.sendStatus(204);
  }

  const deFoundUser = foundUser[0];
  // Delete refresh token in db

  await db
    .collection("operators")
    .updateOne(
      { _id: ObjectID(deFoundUser[0]._id) },
      { $set: { refreshToken: "" } }
    );

  res.clearCookie("rToken", { httpOnly: true, sameSite: "None", secure: true });
  // res.clearCookie("uId", { httpOnly: true, sameSite: "None", secure: true });
  // res.clearCookie("isLogin", {
  //   httpOnly: false,
  //   sameSite: "None",
  //   secure: true,
  // });
  res.sendStatus(204);
};
