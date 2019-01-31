var hash = require('bcryptjs');
var jwt = require('jwt-simple');
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
var request = require('request');

var updateLastLoginTime = (username, last_login_time)=>{
	return new Promise((resolve, reject)=>{
		let query = `UPDATE stores SET last_login_time='${last_login_time}' WHERE username='${username}'`
		sqlQuery.executeQuery([query]).then(()=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var updatFailedLoginAttempts = (username, failed_login_attempts)=>{
	return new Promise((resolve, reject)=>{
		let query = `UPDATE stores SET failed_login_attempts=${failed_login_attempts} WHERE username='${username}'`
		sqlQuery.executeQuery([query]).then(()=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getUserDetails = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * FROM stores WHERE username='${username}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var updateStore = (username)=>{
	return new Promise((resolve, reject)=>{
		getUserDetails(username).then((user)=>{
			if(user[0].credits > 0){
				user[0].credits = user[0].credits -1
				let query = `UPDATE stores SET credits='${user[0].credits}' WHERE username='${username}'`
				sqlQuery.executeQuery([query]).then((result)=>{
					resolve(user)
				}).catch((err)=>{
					reject(err)
				})	
			}else{
				reject()
			}
		})
	})
}

var AdminLogin = (username, password)=>{
	return new Promise((resolve, reject)=>{
		if(!username || !password){
	        reject("Invalid Username / Password")
	    }else{
	    	let query = `SELECT * FROM stores WHERE username='${username}'`
	    	sqlQuery.executeQuery([query]).then((result)=>{
	    		if(result[0].length > 0){
	    			let dbPassword = result[0][0].password
	    			let failed_login_attempts = result[0][0].failed_login_attempts
	    			if(failed_login_attempts > 3){
	    				reject("Account is blocked for multiple unauthorized access. Please contact administrator!")
	    			}
	    			hash.compare(password, dbPassword, function(err, match){
	    				if (!match) {
					    	failed_login_attempts++
					        updatFailedLoginAttempts(username, failed_login_attempts);
					        reject("Invalid Username / Password");
					    }
					    var encodeDetails = {};
					    encodeDetails['username'] = result[0][0].username;
					    encodeDetails['id'] = result[0][0].id;
					    encodeDetails['exp'] = moment().add(180, 'm').valueOf()
					    encodeDetails['admin_type'] = "store"
					    encodeDetails['name'] = result[0][0].store_name;
					    encodeDetails['email'] = result[0][0].email
					    encodeDetails['access_level'] = 'store'

					    let token = jwt.encode(encodeDetails, 'eg[isfd-8axcewfgi43209=1dmnbvcrt67890-[;lkjhyt5432qi24');
					    token = 'JWT ' + token
					    redis_client.hmset(username, 'token', token, 'attempts', 3);
					    redis_client.expire(username, 180 * 60);

					    updateLastLoginTime(username, moment().unix())
					    resolve({token: token, admin_type: "store", name: result[0][0].store_name})
	    			});
	    		}else{
	    			reject("Invalid Username / Password")
	    		}
	    	})
	    }
	})
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

var GenerateToken = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * FROM stores WHERE username='${username}'`
		let encodeDetails = {};
		sqlQuery.executeQuery([query]).then((result)=>{
			encodeDetails['username'] = username;
		    encodeDetails['id'] = result[0][0].id;
		    encodeDetails['email'] = result[0][0].email;
		    encodeDetails['exp'] = moment().add(180, 'h').valueOf()
		    encodeDetails['mobile'] = result[0][0].mobile;
		    encodeDetails['name'] = result[0][0].store_name;

		    const token = jwt.encode(encodeDetails, 'eg[isfd-8axcewfgi43209=1dmnbvcrt67890-[;lkjhyt5432qi24');
	        redis_client.hmset(username, 'token', token, 'attempts', 3);
	        redis_client.expire(username, 180 * 60 * 60);
			resolve(token)
		})
	})
}

var AdminRegister = (request)=>{
	return new Promise((resolve, reject)=>{
		let query
		if(request.store_name && request.store_name != '' && request.email && request.email != '' && request.mobile && request.mobile != '' && request.username && request.username != '' && request.username && request.username != ''){
			if(validateEmail(request.email)){
				if(request.mobile.length != 10){
					hash.genSalt(15, function (error, salt) {
				        hash.hash(request.password, salt, function (err, hashed) {
				        	let query = `INSERT INTO stores(store_name, username, email ,mobile, password, credits) VALUES('${request.store_name}', '${request.username}', '${request.email}', '${request.mobile}', '${hashed}', 10)`
				        	sqlQuery.executeQuery([query]).then(()=>{
				        		GenerateToken(request.username).then((token)=>{
				        			resolve({'message': 'Store registered successfully', 'token': token})
				        		}).catch((err)=>{
				        			reject(`Something went wrong. Please try again`)
				        		})
				        	}).catch((err)=>{
				        		reject(`Username / Email Address / Mobile Number already registered`)
				        	})
				        })
				    })
				}else{
					reject(`Invalid Mobile Number`)
				}
			}else{
				reject(`Invalid Email Address`)
			}
		}else{
			reject(`Please fill in all details`)
		}
	})
}

module.exports = {
	AdminLogin: AdminLogin,
	AdminRegister: AdminRegister,
	getUserDetails: getUserDetails,
	updateStore: updateStore
}