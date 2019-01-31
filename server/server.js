var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var passport = require('passport');
var dbConn = require('./database/databaseConnection');
var jwt = require('jwt-simple');
var redis = require('redis');
var moment = require('moment');
var exec = require('child_process').exec;
var sql_Query = require('./database/sqlWrapper');
var baseUrl = process.env.BASE_URL;

var app = express();

var index = require('./routes/index');
var users = require('./routes/users');
var locations = require('./routes/location');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token, Authorization, Page, URL');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
    res.setHeader('Access-Control-Max-Age', '1000');

    next();
};


app.use(allowCrossDomain);

//Starting Redis Server
redis_client = redis.createClient({port: process.env.REDIS_PORT, host: process.env.REDIS_HOST});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use(session({
    cookieName : 'session',
    secret : 'eg[isfd-8yF9-7w1970df{}+Ijsli;;to9',
    duration : 10 * 60 * 1000,
    activeDuration : 5*60*1000,
    httpOnly : true,
    secure : true
}));


//passport initializatoin
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use(baseUrl + '/store', users);
app.use(baseUrl + '/locations', locations);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    return res.status(404).send({status : false, msg : "API NOT FOUND"});
});


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (id, done) {
    console.log("deserializeUser", id)
    let query = "SELECT * FROM `stores` WHERE id = '" + id.id + "'";
    console.log(query)
    dbConn(function (err, con) {
      con.query(query, function (err, data) {
          con.release();
          if (!data.length) {
              done(err, null);
          }else {
              const passportObj = {
                "id" : data[0].id,
                "access_level" : id.access_level,
                "username" : data[0].username
              }
              done(null, id);
          }
      });
    });
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

/*
 * Send back a 500 error
 */
function handleError(res) {
    return function(error) {
        res.status(500).send({error: error.message});
    }
}

process.on('unhandledRejection', (reason, p) => {
  console.log('/////////////////////////////////////////////////////')
  console.log('Unhandled Rejection at: Promise', p, '\nreason:', reason);
  console.log('/////////////////////////////////////////////////////')
});

module.exports = app;
