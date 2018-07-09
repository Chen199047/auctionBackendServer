const express = require('express'),
    bodyParser = require('body-parser');

module.exports = function(){
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extend:false}));

    //require('../app/routes/user.server.routes')(app);
    //require('../app/routes/auctions.server.routes')(app);

    return app;

};