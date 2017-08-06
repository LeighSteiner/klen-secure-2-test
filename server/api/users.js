const router = require('express').Router()
const {User} = require('../db/models')
module.exports = router
const authMaster = require('klen-secure')();


const userAuthenticator = new authMaster(User);

router.use(userAuthenticator.checkAuthorizations())


router.get('/', (req, res, next) => {

  User.findAll({
    attributes: ['id', 'email']
  })
    .then(users => res.json(users))
    .catch(next)
})

router.get('/siteControllerOnly', userAuthenticator.authFailLogger('isSiteController'), (req, res, next) => {
	res.send('Welcome to the Site Controller Page!');
})


router.get('/ModsOnly', userAuthenticator.authFailLogger('isMod'), (req, res,next) => {
	res.send('Welcome to the Mod Page!');
})


router.get('/AdminsOnly', userAuthenticator.singleRouteSecure('isAdmin'), (req,res,next) => {
	res.send('Hey, Admins! We just checked your security clearance RIGHT NOW!')
})

router.get('/viewAuthFailLog', userAuthenticator.viewAuthFailLog(),(req, res, next) => {
	let log = req.user.authFailLog
	res.send(log);
})

router.get('/getAuthFailLog', userAuthenticator.getAuthFailLog(),(req, res, next) => {
	let log = req.user.authFailLog
	res.send(log);
})




