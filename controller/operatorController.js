const { eLog } = require("../helper/createLog");
const { invalidParams } = require("../config/errors");
const GenerateToken = require("../utils/generateToken");

const { client, db, closeConnection } = require("../config/db");

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
      .collection("operators")
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

          let newRefreshTokenArray = !cookies?.rToken
            ? operator.refreshToken
            : _refreshToken;

          if (cookies?.rToken) {
            const refreshToken = cookies.rToken;

            const foundToken = await db
              .collection("operator")
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
            .collection("operators")
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
          resp.status(401);
        }
      })
      .catch((err) => {
        eLog(err);
      })
      .finally(() => {
        // close connection
        closeConnection();
      });
  } catch (err) {
    eLog(err);
  }
};
