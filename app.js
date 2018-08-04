var express = require('express')
  , path = require('path')
  , bitcoinapi = require('./lib/api')
  , favicon = require('static-favicon')
  , logger = require('morgan')
  , cron = require('node-cron')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , settings = require('./lib/settings')
  , routes = require('./routes/index')
  , request = require('request')
  , Model = require('./lib/model');
var http = require('http');
const mongoose = require('mongoose');
var logo = "esco";
mongoose.connect('mongodb://localhost/explorerdb');

var app = express();
app.set('port', 3001);
var server = http.createServer(app);
server.listen(3001);
server.on('error', function (error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});
server.on('listening', function () {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/gettransaction', function (req, res) {

  switch (req.body.selectpicker) {
    case "esco":
      bitcoinapi.setWalletDetails(settings.esco);
      break;
    case "btci":
      bitcoinapi.setWalletDetails(settings.btci);
      break;
  }
  bitcoinapi.setAccess('only', ['gettransaction', 'getnetworkhashps', 'getmininginfo', 'getdifficulty', 'getconnectioncount',
    'getblockcount', 'getblockhash', 'getblock', 'getrawtransaction', 'getpeerinfo', 'gettxoutsetinfo', 'verifymessage']);
  logo = req.body.selectpicker;

  bitcoinapi.app(req, res).then(function (result1) {
    return res.render("index", { "message": result1, "error": null, "logo": logo, "cur": settings.currencies });
  }).catch(function (error1) {
    return res.render("index", { "error": error1, "message": null, "logo": logo, "cur": settings.currencies });
  })

});

app.get('*', function (req, res) {
  logo = "esco";
  res.render("index", { "message": null, "error": null, "logo": logo, "cur": settings.currencies });
});

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    console.log(err);
  });
}

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  console.log(err);
});

module.exports = app;
