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
		  return async (req,res,next) => {
		    if (req.user){
		    	console.log('HEEEERE')
		      if(!req.user.clearances){ //this is now check authorizations
		      	let output = [];
		      	for (let k in secretLocation[this.id].authObject){
			      let authTest = await secretLocation[this.id].authObject[k](req.user.id);
			      if (authTest){
				    output.push(k);
				  }	
			   } 
		        req.user.clearances = output.filter((elem,ind)=> output.indexOf(elem) === ind);
			    console.log('CLEARANCES: ',req.user.clearances)
			    next();
		      }
			  if(secretLocation[this.id].authObject.hasOwnProperty(whichAuth)){
			    if (req.user.clearances.includes(whichAuth)){
				  next();
				}else{
					let failObj = {
					  user: req.user.id, 
					  date: new Date(), 
                      ipAddress: req.ip,
					}
				  if (secretLocation[this.id].authFailLog[whichAuth]){
				 	secretLocation[this.id].authFailLog[whichAuth].push(failObj );
				 	console.log(whichAuth, 'fail log:',secretLocation[this.id].authFailLog[whichAuth]);
				  }else{
				 	secretLocation[this.id].authFailLog[whichAuth] = [req.user.id];
				 	console.log(whichAuth, "Fail Log: ",secretLocation[this.id].authFailLog[whichAuth])
				  } 
				  next(new Error('You do not have valid clearance'));
				}
		      }else{
				next(new Error('not a valid authorization check'));
			  }
			}else{
			  next(new Error('authFailLog: user is not logged in'));
			}	
		  }
	    }
			
		getAuthFailLog(){
		  return (req, res, next) => {
		    if(secretLocation[this.id].logViewBool){
			  req.user.authFailLog = secretLocation[this.id].authFailLog;
			  next();  
			}else{
			  next(new Error('you cannot modify this log'));
			}
		  }
		}

		}
	}
	)();
}
module.exports = klenSecure;