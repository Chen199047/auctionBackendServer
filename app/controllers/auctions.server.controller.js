const Auctions = require('../models/auctions.server.model');
const fs = require("fs"),
      path = require('path'),
      users = require('../models/user.server.model'),

      app_dir = path.dirname(require.main.filename);
const config = require("../../config/config");

exports.list = function(req,res){


    let options = req.query;
    //console.log(options);


    Auctions.getAuctions(options,function(result){
        if(result == 1){res.status(500).send("Internal server error");}else{
            res.status(200).json(result);
        }



    });

};

exports.create = function (req,res) {
    let auction_data = {
        "categoryId": req.body.categoryId,
        "title": req.body.title,
        "description": req.body.description,
        "startDateTime": req.body.startDateTime,
        "endDateTime": req.body.endDateTime,
        "reservePrice": req.body.reservePrice,
        "startingBid": req.body.startingBid

    };
    /*let auction_categoryid = auction_data['categoryId'];
    let auction_title = auction_data['title'].toString();
    let auction_description = auction_data['description'].toString();
    let auction_startingdate = auction_data['startDateTime'];
    let auction_endingdate = auction_data['endDateTime'];
    let auction_reservepricee = auction_data['reservePrice'];
    let auction_startingprice = auction_data['startingBid'];*/
    let token = req.body.token||req.query.token||req.headers['x-authorization'];





    Auctions.createAuctions(auction_data,token,function (result) {
        //console.log(result);
        if (result==1 ||req.body.startDateTime == null ||req.body.endDateTime == null||req.body.startDateTime > req.body.endDateTime) {res.status(400).send("BAD REQUEST")}
        //else if (req.body.startDateTime == null ||req.body.endDateTime == null){res.status(400).send("Bad request")}
        //else if (req.body.startDateTime > req.body.endDateTime ){res.status(400).send("BAD REQUEST")}
        else{res.status(201).json(result);}



    });

};
exports.read = function (req,res) {
    let auction_id = req.params.id;
    Auctions.readAuction(auction_id,function (result) {
        res.status(200).json(result);

    });

};
exports.update = function (req,res) {
    let auction_id = req.params.id;

    let auction_data = {
        "title": req.body.title,
        "categoryId": req.body.categoryId,
        "description": req.body.description,
        "startDateTime": req.body.startDateTime,
        "endDateTime": req.body.endDateTime,
        "reservePrice": req.body.reservePrice,
        "startingBid": req.body.startingBid


    };
    let token = req.body.token||req.query.token||req.headers['x-authorization'];
    Auctions.updateAuction(auction_id,auction_data,token,function (result) {

        if (result == 4) {
            res.status(404).send({"ERROR": "NOT FOUND"});
        }
        else {

            if (result == 1) {
                res.status(403).send("Forbidden-bidding has begun on the auction");
            }

            else{

                if(result == 2){
                    res.status(401).send("Unouthorized");
                }
                else{
                    if(result == 3){ res.status(401).send("BAD REQUEST")}
                    else{res.status(201).json(result);}
                }

            }

        }

    })

};
exports.readBids = function (req,res) {
    let auction_id = req.params.id;
    Auctions.getBids(auction_id,function (result) {
        if(result == 1){res.status(400).send("BAD REQUEST");}
        if(result == 2){res.status(404).send("NOT FOUND");}

        else{
            res.status(200).json(result);
        }


    });


};
exports.createBids = function (req,res) {
    let auction_id = Number(req.params.id);
    //console.log(auction_id);
    let amount = Number(req.query.amount);
    //console.log(amount);
    let token = req.body.token||req.query.token||req.headers['x-authorization'];
    Auctions.postBids(auction_id,amount,token,function (result) {
        if(result == 1){res.status(400).send("BAD REQUEST")}
        else {
            if (result == 3) {
                res.status(404).send("Not found")
            }
            else {
                if (result == 2) {
                    res.status(500).send("Internal server error.")
                }
                else {
                    res.status(201).json(result);
                }
            }
        }
    })


};
exports.getPhoto = function (req,res) {
    let auction_id = req.params.id;
    if (auction_id <= 0) {res.status(400).send("Bad request")}else{
        let check_path_jpeg = app_dir + "/uploads/" + auction_id + ".jpeg"
        let check_path_png = app_dir + "/uploads/" + auction_id + ".png"

        let default_path = app_dir + "/uploads/default.png"

        fs.stat(check_path_jpeg, function(err, stat){
            if(err){
                fs.stat(check_path_png, function(err, stat){
                    if(err){
                        // Not found JPEG or PNG
                        fs.stat(default_path, function(err, stat){
                            if (err){
                                // There is a problem
                                res.sendStatus(500);
                            }else{
                                // Send the default
                                res.set("Content-Type", 'image/png');
                                res.status(200);
                                res.sendFile(default_path);
                            }
                        });
                    }else{
                        // Its found a png
                        res.set("Content-Type", 'image/png');
                        res.status(200);
                        res.sendFile(check_path_png);
                    }
                });
            }else{
                // Its found a JPEG
                res.set("Content-Type", 'image/jpeg');
                res.sendFile(check_path_jpeg);

            }
        });
    }



};
exports.createPhoto = function (req,res) {
    let auction_id = req.params.id;
    //console.log(auction_id);
    //console.log(app_dir);

    let token = req.get(config.get('authToken'));
    //console.log(token);
    users.getIdFromToken(token,function (err, user_id) {
        //console.log(user_id);
        Auctions.readAuction(auction_id,function (result) {


            let owner_id = result['seller']['id'];
                //console.log(owner_id);
                if(user_id!==owner_id){return res.sendStatus(403)}
            else{
                    let content_type = req.get('Content-Type');
                    console.log('Content-Type=', content_type);
                    if (!content_type){console.log(req)};

                    let file_ext = "";
                    if(content_type === 'image/png'){
                        file_ext = "png";
                    }else if(content_type === 'image/jpeg' || content_type === 'image/jpg'){
                        file_ext = "jpeg";
                    }
                    if (file_ext === '') {console.log('file_ext is empty')};
                    console.log('add_photo:', auction_id + file_ext, 'user_id', owner_id);

                    let check_path_jpeg = "./uploads/" + auction_id + ".jpeg";
                    let check_path_png = "./uploads/" + auction_id + ".png";

                    try{
                        fs.unlink(check_path_jpeg, function(err){
                            if(err){
                                fs.unlink(check_path_png, function(err){
                                    if(err){
                                        console.log(`auctions.controller.add_photo: unlinking existing file returned: ${err}`);
                                    }

                                    req.pipe(fs.createWriteStream('./uploads/' + auction_id + '.' + file_ext));
                                    res.sendStatus(201);

                                });
                            }else{
                                req.pipe(fs.createWriteStream('./uploads/' + auction_id + '.' + file_ext));
                                res.sendStatus(201);
                            }
                        });
                    }catch(e){
                        console.log("error posting image")
                        console.log(e);
                    }
                    //res.status(200).json(result);
                    }




        })

    })


};


exports.removePhoto = function (req,res) {
    let auction_id = parseInt(req.params.id);
    //if (!validator.isValidId(auction_id)) return res.sendStatus(404);

    let token = req.get(config.get('authToken'));
    users.getIdFromToken(token, function(err, _id){
        Auctions.readAuction(auction_id, function(err, results){
            if(err){
                log.warn(`auctions.controller.get_one: model returned err: ${err}`);
                return res.sendStatus(500);
            } else if(!results || results.length == 0){
                return res.sendStatus(404);
            }else{
                let result = results[0];
                log.warn(result);
                let owner_id = result['auction_userid']

                if(_id !== owner_id){
                    return res.sendStatus(403);
                }else{
                    let check_path_jpeg = "./uploads/" + auction_id + ".jpeg"
                    let check_path_png = "./uploads/" + auction_id + ".png"

                    fs.unlink(check_path_jpeg, function(err){
                        if(err){
                            fs.unlink(check_path_png, function(err){
                                if(err){
                                    log.warn(`auctions.controller.delete_photo: unlinking file returned: ${err}`);
                                    res.sendStatus(500);
                                }else{
                                    res.sendStatus(201);
                                }
                            });
                        }else{
                            res.sendStatus(201)
                        }
                    });
                }
            }
        });
    });

};

//reset db and sample data
exports.reset = function (req,res) {
    let sql_text = fs.readFileSync('config/init_db.sql').toString();


    //console.log(sql_text);
    Auctions.reset(sql_text,function (result) {
        if (result==1){res.status(500).send("Internal server error")}else{
            res.status(200).json(result);
        }

    })




};
exports.resample = function (req,res) {
    let sql_sampleData = fs.readFileSync('config/sampleData.sql').toString();
    Auctions.resample(sql_sampleData,function (result) {
        if (result==1){res.status(500).send("Internal server error")}else{
            res.status(201).json(result);
        }

    })


};