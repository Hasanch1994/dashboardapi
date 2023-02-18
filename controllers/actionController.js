const { eLog } = require("../helper/createLog");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const fs = require("fs");
const GenerateToken = require("../utils/generateToken");

const {
  updateSuccessfully,
  insertSuccessfully,
  deleteSuccessfully,
  insertFailed,
} = require("../helper/errors");
require("dotenv").config();
const {
  expDB,
  abDB,
  skDB,
  portDB,
  contactDB,
  opDB,
} = require("../helper/collectionNames");
const { client, db } = require("../config/db");
const { ObjectID } = require("bson");
const {
  deletePortfolioImage,
  portfolioStorage,
} = require("../helper/uploadUtils");
const multer = require("multer");
const { query } = require("express");
//config multer with multipart images with max count 8
const upload = multer({ storage: portfolioStorage }).array("Images", 8);

/*
  about routes
  contains update
*/
exports.updateBaseInfo = async (req, resp) => {
  try {
    const {
      name,
      about,
      title,
      links,
      education,
      languages,
      interests,
      phoneNumber,
      location,
    } = req.body;

    // connect to db
    await client.connect();
    const id = process.env.UID;
    await db
      .collection(abDB)
      .updateOne(
        { id: id },
        {
          $set: {
            name: name,
            about: about,
            title: title,
            links: links,
            languages: languages,
            education: education,
            interests: interests,
            phoneNumber: phoneNumber,
            location: location,
          },
        },
        { upsert: true }
      )
      .then(async (result) => {
        resp.status(200).send({ msg: updateSuccessfully });
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

/*
  skill controllers
  contains add,delete,get and update for skills
*/

// method for get all skills
exports.getSkills = async (req, resp) => {
  try {
    // connect to db
    await client.connect();
    await db
      .collection(skDB)
      .find({})
      .sort({ _id: -1 })
      .toArray()
      .then(async (result) => {
        resp.status(200).send(result);
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

// method for delete new skill with name and value
exports.addNewSkill = async (req, resp) => {
  try {
    const { name, value } = req.body;
    // connect to db
    await client.connect();
    await db
      .collection(skDB)
      .insertOne({
        name: name,
        value: value,
      })
      .then(async () => {
        // fetch inserted Id
        const result = await db
          .collection(skDB)
          .find({})
          .sort({ _id: -1 })
          .limit(1)
          .toArray();
        resp.status(201).send({ msg: insertSuccessfully, _id: result[0]._id });
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

// method for delete skill
exports.deleteSkill = async (req, resp) => {
  try {
    const { id } = req.params;

    // connect to db
    await client.connect();
    await db
      .collection(skDB)
      .deleteOne({
        _id: ObjectID(id),
      })
      .then(async () => {
        resp.status(200).send({ msg: deleteSuccessfully });
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

// method for update skill
exports.updateSkill = async (req, resp) => {
  try {
    const { id, name, value } = req.body;

    // connect to db
    await client.connect();
    await db
      .collection(skDB)
      .updateOne(
        {
          _id: ObjectID(id),
        },
        {
          $set: {
            name: name,
            value: value,
          },
        }
      )
      .then(async () => {
        resp.status(200).send({ msg: updateSuccessfully });
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

/*
  portfolio controllers
  contains add,delete and get for portfolio
*/

// method for get all portfolio
exports.getPortfolios = async (req, resp) => {
  try {
    // connect to db
    await client.connect();
    await db
      .collection(portDB)
      .find({})
      .toArray()
      .then(async (result) => {
        resp.status(200).send(result);
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

// method for delete portfolio
exports.deletePortfolio = async (req, resp) => {
  try {
    const { id } = req.params;

    // connect to db
    await client.connect();

    // first fetch names of portfolio images for delete from the storage
    const imageNames = await db
      .collection(portDB)
      .find({ _id: ObjectID(id) })
      .toArray();

    const imageURLS = imageNames[0].imageUrls;

    await db
      .collection(portDB)
      .deleteOne({
        _id: ObjectID(id),
      })
      .then(async () => {
        //delete images from storage if urls founded
        if (imageURLS && imageURLS.length > 0) {
          deletePortfolioImage(imageURLS);
          resp.status(200).send({ msg: deleteSuccessfully });
        }
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

// method for add new skill with upload multipart images
exports.addPortfolio = async (req, resp) => {
  try {
    const { title, description, date, githubLink } = req.body;
    // connect to db
    await client.connect();
    await db
      .collection(portDB)
      .insertOne({
        title: title,
        description: description,
        date: date,
        githubLink: githubLink,
      })
      .then(async () => {
        if (req.files) {
          //update collection imageURL fields with image links
          const names =
            req.files &&
            req.files.map((item) => process.env.IMAGEBASEURL + item.filename);

          const result = await db
            .collection(portDB)
            .findOneAndUpdate(
              {},
              { $set: { imageUrls: names } },
              { upsert: true, sort: { created: -1 } }
            );

          if (result) {
            resp.status(201).send({ msg: insertSuccessfully });
          }
        } else {
          resp.status(201).send({ msg: insertSuccessfully });
        }

        // upload(req, resp, async (err) => {
        //   console.log(req.files);
        //   if (err) throw err;
        //   else {

        //       resp.status(201).send({ msg: insertSuccessfully });
        //     } else {
        //       resp.status(500).send({ msg: insertFailed });
        //     }
        //   }
        // });
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

/*
  experiences controllers
  contains add,delete,update and get for experiences
*/

// method for add new experience
exports.addExperience = async (req, resp) => {
  try {
    const { from, to, title, text } = req.body;
    // connect to db
    await client.connect();
    await db
      .collection(expDB)
      .insertOne({
        title: title,
        from: from,
        to: to,
        text: text,
        status: to ? false : true,
      })
      .then(async () => {
        resp.status(201).send({ msg: insertSuccessfully });
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

// method for get all experiences
exports.getExperiences = async (req, resp) => {
  try {
    // connect to db
    await client.connect();
    await db
      .collection(expDB)
      .find({})
      .toArray()
      .then(async (result) => {
        resp.status(200).send(result);
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

// method for delete experience
exports.deleteExperience = async (req, resp) => {
  try {
    const { id } = req.body;

    // connect to db
    await client.connect();

    await db
      .collection(expDB)
      .deleteOne({
        _id: ObjectID(id),
      })
      .then(async () => {
        resp.status(200).send({ msg: deleteSuccessfully });
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

// method for update experience
exports.updateExperience = async (req, resp) => {
  try {
    const { id, title, from, to, text } = req.body;

    // connect to db
    await client.connect();
    await db
      .collection(expDB)
      .updateOne(
        {
          _id: ObjectID(id),
        },
        {
          $set: {
            title: title,
            from: from,
            to: to,
            text: text,
            status: to ? false : true,
          },
        }
      )
      .then(async () => {
        resp.status(200).send({ msg: updateSuccessfully });
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

/*
  contact controllers
    contains add and get for contact us

*/

// method for add new experience
exports.addContact = async (req, resp) => {
  try {
    const { nameFamily, emailAddress, requestType, message } = req.body;
    // connect to db
    await client.connect();
    await db
      .collection(contactDB)
      .insertOne({
        nameFamily: nameFamily,
        emailAddress: emailAddress,
        requestType: requestType,
        message: message,
        date: Date.now(),
        visited: false,
      })
      .then(async () => {
        resp.status(201).send({ msg: insertSuccessfully });
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

// method for get all contactUs
exports.getContactUs = async (req, resp) => {
  console.log("in get ");
  try {
    // connect to db
    await client.connect();
    await db
      .collection(contactDB)
      .find({})
      .sort({ date: -1 })
      .toArray()
      .then(async (result) => {
        resp.status(200).send(result);
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

// method for get all contactUs
exports.readContact = async (req, resp) => {
  const { id } = req.params;
  try {
    // connect to db
    await client.connect();
    await db
      .collection(contactDB)
      .updateOne({ _id: ObjectID(id) }, { $set: { visited: true } })
      .then(async (result) => {
        resp.status(200).send({ msg: "updated" });
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

/*
  refresh Token
*/

exports.handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.rToken) return res.sendStatus(401);
  const refreshToken = cookies.rToken;
  res.clearCookie("rToken", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  const PUBLIC_KEY = fs.readFileSync("./files/refreshToken/public.key");
  let foundUser;

  // connect to database
  await client.connect();
  foundUser = await db
    .collection(opDB)
    .find({ refreshToken: refreshToken })
    .toArray()[0];

  console.log(foundUser);

  // Detected refresh token reuse!
  if (!foundUser) {
    jwt.verify(refreshToken, PUBLIC_KEY, async (err, decoded) => {
      if (err) return res.sendStatus(403); //Forbidden

      //remove token

      await db
        .collection(opDB)
        .updateOne(
          { _id: ObjectID(decoded.userId) },
          { $set: { refreshToken: "" } }
        );
    });
    return res.sendStatus(403); //Forbidden
  }

  const newRefreshTokenArray = foundUser.refreshToken;
  // evaluate rToken

  jwt.verify(refreshToken, PUBLIC_KEY, async (err, decoded) => {
    if (err) {
      await db
        .collection(opDB)
        .updateOne(
          { _id: ObjectID(foundUser._id) },
          { $set: { refreshToken: newRefreshTokenArray } }
        );
    }
    if (err || foundUser.userId !== decoded.userId) return res.sendStatus(403);

    const gToken = new GenerateToken();

    const _accessToken = await gToken.accessToken(
      foundUser._id,
      foundUser.opName
    );

    const _refreshToken = await gToken.refreshToken(foundUser._id);

    // Saving refreshToken with current user

    await db
      .collection(opDB)
      .updateOne(
        { _id: ObjectID(foundUser._id) },
        { $set: { refreshToken: _refreshToken.refreshToken } }
      );

    // Creates Secure Cookie with refresh token
    res.cookie("rToken", _refreshToken.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.json({ _accessToken });
  });
};
