function klenSecure(){
	return (function(){
		var secretLocation = {};
		var secretId = 0;
		return class {
			constructor(modelAuthenticator, authObject, logViewBool, config){

				this.id = secretId++
				secretLocation[this.id] = {
					logViewBool : logViewBool || false, //default setting is that you canNOT modify the log 
					getAuthFailLog : this.getAuthFailLog
				};

				this.modelAuthenticator = modelAuthenticator;

				secretLocation[this.id].authFailLog = {};

				secretLocation[this.id].authObject = authObject || {  
					 isUser : async (id) => {                        // async await requires at least Node 7.6
						let user = await this.modelAuthenticator.findById(id)
						return !!user;
					}, 
					isMod : async (id) => {
						let user = await this.modelAuthenticator.findById(id)
						 return !!user.isMod;
					},
					isAdmin: async (id) =>{
						let user = await this.modelAuthenticator.findById(id)
						return !!user.isAdmin; 
					},
					isSiteController : async (id) => {
						let user = await this.modelAuthenticator.findById(id)
						return !!user.isSiteController;
					}
				}


			}

		authFailLogger(whichAuth){
          return async (req, res, next) => {
          	try{
          	  if (req.user){
                if(!req.user.clearances){
                	let output = []
                	for (let k in secretLocation[this.id].authObject){
                	  let authTest = await secretLocation[this.id].authObject[k](req.user.id);
                	  if(authTest){
                	  	output.push(k);
                	  }
                	}
                  req.user.clearances = output
                  console.log('Clearances: ', req.user.clearances);
                }

                if(secretLocation[this.id].authObject.hasOwnProperty(whichAuth)){
                  if(req.user.clearances.includes(whichAuth)){
                  	next();
                  }else{
                    let failObj = {
                  	  user: req.user.id, 
                  	  date: new Date(), 
                  	  ipAddress: req.ip,
                    }
                     if (secretLocation[this.id].authFailLog[whichAuth]){
                  	   secretLocation[this.id].authFailLog[whichAuth].push(failObj);
                  	   console.log(whichAuth, ' fail log: ', secretLocation[this.id].authFailLog[whichAuth])
                     }else{
                  	   secretLocation[this.id].authFailLog[whichAuth]= [failObj];
                  	   console.log(whichAuth, ' fail log: ', secretLocation[this.id].authFailLog[whichAuth])
                     }
                   throw new Error('You do not have valid clearance to view '+ whichAuth)
                  }
                }else{
                  throw new Error('not a valid authorization check: '+ whichAuth)
                }
          	  }else{
          	  	throw new Error('user is not logged in')
          	  }
          	} catch(e){
          	 res.status(403).send(e.message);
          	 
          	}
          }
	    }
			
		getAuthFailLog(){
		  return (req, res, next) => {
		    try{
		      if(secretLocation[this.id].logViewBool){
			    req.user.authFailLog = secretLocation[this.id].authFailLog;
			    next();  
			  }else{
			    throw new Error('you cannot view this log');
			  }
		    }catch(e){
		      res.status(403).send(e.message);
		    }

		  }
		}

		clearAuthFailLog(){
		  return (req, res, next) => {
		  	try{
              if(secretLocation[this.id].logViewBool){
			    secretLocation[this.id].authFailLog = 
			    {lastCleared: {
 				    date: new Date(), 
 				    user: req.user.id
			      }
			    }
			    next();
			  }else{
			    throw new Error('you cannot clear this log');
			  }
		  	}catch(e){
		      res.status(403).send(e.message);
		  	}

		  }
		}

		}
	}
	)();
}
module.exports = klenSecure;