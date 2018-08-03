const express = require('express'),
    bodyParser = require('body-parser');

module.exports = function(){
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extend:false}));
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Authorization");
        res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
        next();
    });

    app.get('/', function(req, res){
        res.status(200).json({"msg": "Server up"});
    });

    require('../app/routes/user.server.routes')(app);
    require('../app/routes/auctions.server.routes')(app);

    return app;

};