var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var sqlQuery = require('../database/sqlWrapper');
var jwt = require('jwt-simple');
var _ = require('underscore');

module.exports = function(passport){
    var opts = {};
    let redis_key, query;
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = 'eg[isfd-8axcewfgi43209=1dmnbvcrt67890-[;lkjhyt5432qi24';
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    	console.log("jwt_payload", jwt_payload)
        query = "SELECT * FROM `stores` WHERE id = '" + jwt_payload.id + "'";
        console.log("passport",query, jwt_payload)
      sqlQuery.executeQuery([query]).then((results) => {
        console.log(results)
            if(!("type" in jwt_payload)){
                console.log("inside if")
                delete results[0][0].password;
                redis_key = results[0][0].username;

                if(Object.keys(results[0]).length > 0){
                    results[0][0]["access_level"] = "store";
                    console.log(results[0][0])
                    redis_client.hgetall(redis_key, (err,reply) => {
                        console.log("<<<done>>>")
                        done(null, results[0][0]);
                    })
                }else {
                    done(null, false);
                }
            }else if ("type" in jwt_payload && jwt_payload.type==="email_validation"){
                    // console.log("the email validation went successfully");
                console.log("inside else if")
                    done(null, results[0][0]);
            }
        }).catch((error) => {
                console.log("inside catch", error)
            return done(null, false);
        });
    }))
};
