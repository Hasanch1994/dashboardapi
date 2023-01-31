require("dotenv").config();

module.exports = {
  //about collection
  abDB: process.env.ABDB,
  //experiences collection
  expDB: process.env.EXPDB,
  //operators collection
  opDB: process.env.OPDB,
  //portfolios collection
  portDB: process.env.PORTDB,
  //skills collection
  skDB: process.env.SKDB,
  // contact us collection
  contactDB: process.env.CONTACT,
};
