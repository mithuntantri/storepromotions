var dbConn = require('../database/databaseConnection');
var mysql     =    require('mysql');
var connProperties = require('../database/dbConfig');
var pool      =    mysql.createPool(connProperties.connection);

module.exports = {
    executeQuery : function (query) {
        var Promises = [];
        return new Promise(function (resolve, reject) {
            dbConn(function (err, con) {
                if(err){
                    reject(err);
                }else{
                    var exec = function (Query) {
                        return new Promise(function (resolve, reject) {
                            con.query(Query, function (err, data) {
                                if(err){
                                    reject(err);
                                }else{
                                    resolve(data);
                                }
                            });
                        });
                    };
                    for(var i = 0;i<query.length;i++){
                        Promises.push(exec(query[i]));
                    }
                }
                Promise.all(Promises).then(function (result) {
                    Promises = []
                    if(con)
                        con.release();
                    resolve(result);
                }).catch(function (error) {
                    Promises = []
                    if(con)
                        con.release();
                    reject(error);
                })
            })
        })
    }
};
