const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config'); // Make sure to replace this with your actual configuration

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        next({ status: 401, message: 'Token Invalid' });
      } else {
        req.decodedJWT = decoded;
        next();
      }
    });
  } else {
    next({ status: 401, message: 'Token Required' });
  }
};
