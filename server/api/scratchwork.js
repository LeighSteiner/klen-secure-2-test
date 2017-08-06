	

					isUser : (id) => { return true},
					isMod : (id) => { return true},
					isAdmin:  (id) => { return true}, 
					isSiteController :  (id) => { return false}, 




			 checkAuthorizations(){ 
			 	let output = [];
			 	return (req,res,next) => {
			 		if(req.user){
					 		for (let k in secretLocation[this.id].authObject){
						 		if (secretLocation[this.id].authObject[k](req.user.id)){
						 			output.push(k);
						 		}
					 		
				 		} 
				 		req.user.clearances = output.filter((elem,ind)=> output.indexOf(elem) === ind);
					 	console.log('clearance: ',req.user.clearances)
				 		next();
				 	}else{
				 		next(new Error('checkAuth: user is not logged in'));
				 	}
			 	}
			 }