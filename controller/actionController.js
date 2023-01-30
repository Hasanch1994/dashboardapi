const { eLog } = require("../helper/createLog");
const { updateSuccessfully } = require("../config/errors");

const { client, db } = require("../config/db");

// method for login user and generate token
exports.updateBaseInfo = async (req, resp) => {
  try {
    const { name, about, title, links, education, languages, interests } =
      req.body;
    // connect to db
    await client.connect();

    await db
      .collection("about")
      .updateOne(
        { id: 1 },
        {
          $set: {
            name: name,
            about: about,
            title: title,
            links: links,
            languages: languages,
            education: education,
            interests: interests,
          },
        }
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
