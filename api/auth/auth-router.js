const router = require("express").Router();
const db = require("../../data/dbConfig");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const {
  checkSubmission,
  checkUsernameAvailability,
} = require("./auth-middleware");
const { BC_ROUNDS, JT_SECRET } = require("../../config");

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1d",
  };
  return JWT.sign(payload, JT_SECRET, options);
}

router.post(
  "/register",
  checkSubmission,
  checkUsernameAvailability,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Check if both username and password are provided
      if (!username || !password) {
        return res.status(400).json({ message: "username and password required" });
      }

      const newUser = {
        username: username,
        password: await bcrypt.hash(password, BC_ROUNDS),
      };
      const newId = await db("users").insert(newUser);
      const [user] = await db("users").where("id", newId);

      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }
);

router.post("/login", checkSubmission, async (req, res, next) => {
  try {
    let { username, password } = req.body;
    const newU = await db('users')
      .where('username', username)
      .first();

    if (newU && bcrypt.compareSync(password, newU.password)) {
      const token = generateToken(newU);
console.log(token)
      res.status(200).json({
        message: `Welcome ${newU.username}!, have a token...`,
        token,
        
      });
    } else {
      res.status(401).json({ message: 'username and password required' });
    }
  } catch (err) {
    next(err);
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

module.exports = router;
