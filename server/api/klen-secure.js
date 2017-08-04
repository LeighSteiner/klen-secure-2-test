function authMaster(){
	return (function(){
		var secretLocation = {};
		var secretId = 0;
		return class {
			constructor(modelAuthenticator, authObject, logViewBool){

				this.id = secretId++
				secretLocation[this.id] = {
					authFailLog : {}, 
					logViewBool : logViewBool || false //default setting is that you canNOT modify the log 
				};

				// this.checkAuthorizations = this.checkAuthorizations.bind(this);
				// this.authFailLogger = this.authFailLogger.bind(this);
				// this.getAuthFailLog = this.getAuthFailLog.bind(this);
				// this.viewAuthFailLog = this.viewAuthFailLog.bind(this);

				this.modelAuthenticator = modelAuthenticator;
				
				secretLocation[this.id].authObject = authObject || {  //can we contain the Sequelize in the authObj? 
					 isUser : async (id) => {  ///REQUIRES NODE 7.6 
						let user = await this.modelAuthenticator.findById(id)
						return !!user;
					}, 
					// isThisUser : async function(id, targetId){},  //this doesn't work because it doesn't match
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
					} //make DRYer 
					// isParticularClearance(id, clearanceStr){} //is this a better check ModelAuthenticator[clearanceStr]: true
				}

			}

			 checkAuthorizations(){ 
			 	let output = [];
			 	return (req,res,next) => {
			 		if(req.user){
			 			
					 		for (let k in secretLocation[this.id].authObject){
						 		if (secretLocation[this.id].authObject[k](req.user.id)){
						 			output.push(k);
						 		}
					 		req.user.clearances = output;
					 		console.log('clearance: ',req.user.clearances)
				 		} //check if req.user.clearances.contains(x)
				 		next();
				 	}else{
				 		next(new Error('checkAuth: user is not logged in'));
				 	}
			 	}
			 }

			 authFailLogger(whichAuth){
			 	return (req,res,next) => {
				 	if (req.user){
				 		if(secretLocation[this.id].authObject.hasOwnProperty(whichAuth)){
				 			if (req.user.clearances.includes(whichAuth)){
				 				next();
				 			}else{
				 				if (secretLocation[this.id].authFailLog[whichAuth]){
				 					secretLocation[this.id].authFailLog[whichAuth].push(req.user.id);


				 				}else{
				 					secretLocation[this.id].authFailLog[whichAuth] = [req.user.id];
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
				if(secretLocation[this.id].logViewBool){
					return secretLocation[this.id].authFailLog;  //might allow for modification?  maybe is another param for function
				}else{
					throw new Error('you cannot modify this log');
				}
			}

			viewAuthFailLog(){
				return secretLocation[this.id].authFailLog.toString();;
			}
		}
	}
	)();
}
module.exports = authMaster;