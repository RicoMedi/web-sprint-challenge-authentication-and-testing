const db = require("../../data/dbConfig");

const checkSubmission = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (username|| password) {
      next();
    } else {
     res.status(400).json({message: "username and password required"});
    }
  } catch (err) {
    next(err);
  }
};

const checkUsernameAvailability = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await db("users")
      .where("username", username)
      .select("username")
      .first();
    if (!user) {
      next();
    } else {
      next({ status: 400, message: "username taken" });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkSubmission,
  checkUsernameAvailability,
};
