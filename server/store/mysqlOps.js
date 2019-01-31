var hash = require('bcryptjs');
var jwt = require('jwt-simple');
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");

const createStoreTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS stores (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						store_name VARCHAR(64) NOT NULL,
						username VARCHAR(32) NOT NULL, 
						email VARCHAR(64) NULL,
						mobile VARCHAR(10) NULL,
						password VARCHAR(255) NOT NULL, 
						first_time_login boolean NOT NULL DEFAULT true,
						last_login_time VARCHAR(32), 
						failed_login_attempts INT NOT NULL DEFAULT 0,
						device_id VARCHAR(48) NULL DEFAULT NULL,
						push_token VARCHAR(256) NULL DEFAULT NULL,
						credits INT NOT NULL DEFAULT 0,
						UNIQUE(username),
						UNIQUE(email),
						UNIQUE(mobile)
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			if(result[0]['warningCount'] == 0){
				resolve()
			}else{
				resolve()				
			}
		}).catch((err)=>{
			reject(err)
		})
	})
}

const createLocationsTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS locations (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						mobile VARCHAR(10) NOT NULL,
						latitude FLOAT NOT NULL, 
						longitude FLOAT NOT NULL,
						timestamp BIGINT NOT NULL
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			if(result[0]['warningCount'] == 0){
				resolve()
			}else{
				resolve()				
			}
		}).catch((err)=>{
			reject(err)
		})
	})
}

const createTables = async () =>{
	return new Promise((resolve, reject)=>{
		console.log(" [*] Creating neccessary tables (if not exists)")
		Promise.all([createStoreTable(), createLocationsTable()]).then(()=>{
			resolve()			
		}).catch((err)=>{
			reject(err)
		})
	})
}

const createDatabase = async () =>{
	return new Promise((resolve, reject)=>{
		console.log(" [*] Creating neccessary database (if not exists)")
		let database_name = process.env.MYSQL_DBNAME
		let query = `CREATE DATABASE IF NOT EXISTS ${database_name}`
		sqlQuery.executeQuery([query]).then((result)=>{
			createTables().then(()=>{
				resolve()				
			})
		}).catch((err)=>{
			reject(err)
		})
	})
}

module.exports = {
	createDatabase: createDatabase,
	createTables: createTables
}