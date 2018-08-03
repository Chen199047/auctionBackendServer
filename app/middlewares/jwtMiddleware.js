const jwt = require('jsonwebtoken');

const myMiddleware = function (req,res,next) {
    const token = req.body.token||req.query.token||req.headers['x-authorization'];
    if (token){
        jwt.verify(token,'199051',function(err,decoded){
            if(err){
                return res.status(401).send({'ERROR':"TOKEN NOT MATCH"});

            }else{
                req.decoded = decoded;
                console.dir(req.user);
                next();
            }
        });
    }else{
        return res.status(400).send({"ERROR":"NO Token"});
    }

};

const creatToken = function (user_data) {
    let token = jwt.sign(user_data,"199051",{
        expiresIn:1440
    });

    return token;

};

module.exports={
    myMiddleware:myMiddleware,
    creatToken:creatToken
};