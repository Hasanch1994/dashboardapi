const { eLog } = require("../helper/createLog");
const {
  updateSuccessfully,
  insertSuccessfully,
  deleteSuccessfully,
} = require("../config/errors");
require("dotenv").config();

const { client, db } = require("../config/db");
const { ObjectID } = require("bson");

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
  contains add,delete and update for skills
*/

// method for delete new skill with name and value
exports.addNewSkill = async (req, resp) => {
  try {
    const { name, value } = req.body;

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
