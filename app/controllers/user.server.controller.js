const User = require('../models/user.server.model');
//const jwt = require('jsonwebtoken');
const myMiddleware = require('../middlewares/jwtMiddleware');




//const jwt = require('jsonwebtoken');

exports.list = function(req,res){
    User.getAll(function(result){
        res.json(result);
    });

};
exports.create = function(req,res){
    let user_data = {
        "user_username" : req.body.username,
        "user_givenname" : req.body.givenName,
        "user_familyname" : req.body.familyName,
        "user_email" : req.body.email,
        "user_password" : req.body.password
    };
    let user_username = user_data['user_username'].toString();
    let user_givenname = user_data['user_givenname'].toString();
    let user_familyname = user_data['user_familyname'].toString();
    let user_email = user_data['user_email'].toString();
    let user_password = user_data['user_password'].toString();
    let values = [[user_username,user_givenname,user_familyname,user_email,user_password]];
    let p = /^([\w\.-]+)@([a-zA-Z0-9-]+)(\.[a-zA-Z\.]+)$/;


    User.insert(values,function (result) {
        if (result == 1){
            res.status(500).send("Internal server error")
        }

        else{
            if(user_email.search(p) == -1){
                res.status(400).send("Malformed request")
            }else{



                res.status(201).json(result);}
        }


    })

};
exports.logout = function(req,res){
    let token = req.body.token||req.query.token||req.headers['x-authorization'];
    User.remove(token,function (result) {
        if(result == 1){
            res.status(500).send("Internal server error")
        }else{

            res.send(result);

        }

    })
};

exports.login = function(req,res){

    let user_data = {
        "user_username" : req.query.username,
        "user_email" : req.query.email,
        "user_password" : req.query.password
    };
    let token = myMiddleware.creatToken(user_data);
    //console.log(user_data);
    //console.log(req.params.username);
    //console.log(req.body.username);
    User.loginUser(user_data, token, function (result) {
        /*res.json({
            error:false,
            message: "succussful login",
            token: token
        });*/
        if(result == 1) {res.status(400).send("Invalid username/email");}
        else{ res.status(200).json(result);}

    });

};

exports.read = function(req,res){

    let user_id = req.params.id;
    //console.log(user_id);
    User.getOne(user_id,function (result) {
        res.json(result);

    });

};
exports.update = function(req,res){
    let id = req.params.id;
    let user_data = {
        "user_givenname": req.body.givenName,
        "user_familyname":req.body.familyName
    };
    User.alter(id,user_data,function (result) {

        if (result ==1){
            res.status(500).send("ERROR")

        } else
        {res.status(201).json(result);}


    });

};
