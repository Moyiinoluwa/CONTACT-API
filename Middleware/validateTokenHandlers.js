const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken');


const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;
  console.log('Authorization Header:', authHeader);
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
    console.log('Received Token:', token); 

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        console.log('JWT VERIFICATION FAILED', err)
        res.status(401);
        throw new Error('User is not authorized, please log in');
      }
      req.user = decoded.user;
      next();
    });
  } else {
    res.status(401);
    throw new Error('User is not authorized');
  }
});

module.exports = validateToken