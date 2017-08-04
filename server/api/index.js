const router = require('express').Router();
const path = require('path');
const {User} = require(path.join(__dirname, '../db/models'))
module.exports = router;
const authMaster = require('./klen-secure')();



  //klen-secure clearance check 

// console.log(User);
 // const userAuthenticator = new authMaster(User);

 // router.use(userAuthenticator.checkAuthorizations())



router.use('/users', require('./users'))

router.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

