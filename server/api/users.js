const router = require('express').Router()
const {User} = require('../db/models')
module.exports = router
const authMaster = require('./klen-secure')();


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
// http://localhost:8080/api/users/siteControllerOnly

router.get('/ModsOnly', userAuthenticator.authFailLogger('isMod'), (req, res,next) => {
	res.send('Welcome to the Mod Page!');
})

// http://localhost:8080/api/users/ModsOnly