const db = require("../../data/dbConfig");


const checkUsernameAvailability = (req, res, next) => {
  next();
};

module.exports = {
 checkUsernameAvailability,
};
