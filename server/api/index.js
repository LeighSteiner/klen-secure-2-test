const router = require('express').Router();
const path = require('path');
const {User} = require(path.join(__dirname, '../db/models'))
module.exports = router;
// const authMaster = require('./klen-secure')();



 // const userAuthenticator = new authMaster(User);



router.use('/users', require('./users'))

router.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

