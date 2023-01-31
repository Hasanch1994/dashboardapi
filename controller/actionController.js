const { eLog } = require("../helper/createLog");
require("dotenv").config();
const {
  updateSuccessfully,
  insertSuccessfully,
  deleteSuccessfully,
} = require("../config/errors");
require("dotenv").config();

const { client, db } = require("../config/db");
const { ObjectID } = require("bson");
const {
  deletePortfolioImage,
  portfolioStorage,
} = require("../helper/uploadUtils");
const multer = require("multer");
const { query } = require("express");
//config multer with multipart images with max count 4
const upload = multer({ storage: portfolioStorage }).array("Image", 4);

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
      .collection("about")
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
      .collection("skills")
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

// method for delete new skill with name and value
exports.addNewSkill = async (req, resp) => {
  try {
    const { name, value } = req.body;
    console.log(req.body);
    // connect to db
    await client.connect();
    await db
      .collection("skills")
      .insertOne({
        name: name,
        value: value,
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

// method for delete skill
exports.deleteSkill = async (req, resp) => {
  try {
    const { id } = req.body;

    // connect to db
    await client.connect();
    await db
      .collection("skills")
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
      .collection("skills")
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
  portfolio routes
  contains add,delete and get for portfolio
*/

// method for get all portfolio
exports.getPortfolios = async (req, resp) => {
  try {
    // connect to db
    await client.connect();
    await db
      .collection("portfolio")
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
    const { id } = req.body;

    // connect to db
    await client.connect();

    // first fetch names of portfolio images for delete from the storage
    const imageNames = await db
      .collection("portfolio")
      .find({ _id: ObjectID(id) })
      .toArray();

    const imageURLS = imageNames[0].imageUrls;

    await db
      .collection("portfolio")
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
    const { title, description, date } = req.body;
    // connect to db
    await client.connect();
    await db
      .collection("portfolio")
      .insertOne({
        title: title,
        description: description,
        date: date,
      })
      .then(async () => {
        upload(req, resp, async (err) => {
          if (err) throw err;
          else {
            //update collection imageURL fields with image links
            const names = req.files.map(
              (item) => process.env.IMAGEBASEURL + item.filename
            );

            const result = await db
              .collection("portfolio")
              .findOneAndUpdate(
                {},
                { $set: { imageUrls: names } },
                { upsert: true, sort: { created: -1 } }
              );

            resp.status(201).send({ msg: insertSuccessfully });
          }
        });
      })
      .catch((err) => {
        eLog(err);
      });
  } catch (err) {
    eLog(err);
  }
};

/*
  experiences routes
  contains add,delete,update and get for experiences
*/

// method for add new experience
exports.addExperience = async (req, resp) => {
  try {
    const { from, to, title, text } = req.body;
    // connect to db
    await client.connect();
    await db
      .collection("experiences")
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
      .collection("experiences")
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
      .collection("experiences")
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
      .collection("experiences")
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
