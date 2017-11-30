const router = require('express').Router()
const {User} = require('../db/models')
module.exports = router
const klenSecure = require('./klen-secure')();


const userAuthenticator = new klenSecure(User, null, true);

//router.use(userAuthenticator.checkAuthorizations())


router.get('/', (req, res, next) => {

  User.findAll({
    attributes: ['id', 'email']
  })
    .then(users => res.json(users))
    .catch(next)
})

router.get('/siteControllerOnly', userAuthenticator.authFailLogger('isSiteController'), (req, res, next) => {
	res.json('Welcome to the Site Controller Page!')
})


router.get('/ModsOnly', userAuthenticator.authFailLogger('isMod'), (req, res,next) => {
	res.json('Welcome to the Mod Page!')
})


router.get('/getAuthFailLog', userAuthenticator.getAuthFailLog(),(req, res, next) => {
	let log = req.user.authFailLog
	res.json(log);
})

router.get('/userFail', userAuthenticator.userFailLog(8), (req,res,next) => {
	//let log = req.user.singleUserLog[8]
	res.json('hi');
})



