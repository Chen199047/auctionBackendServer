const db = require('../../config/db');
const dateTime = require('node-datetime');



exports.getAuctions = function(options,done){
    if(!options.hasOwnProperty('count')) options.count = 10000;
    if(!options.hasOwnProperty('startIndex')) options.startIndex = 0;
    if(!options.hasOwnProperty('q')) options.q = null;
    if(!options.hasOwnProperty('category_id')) options.category_id = null;
    if(!options.hasOwnProperty('bidder')) options.bidder = null;
    if(!options.hasOwnProperty('winner')) options.winner = null;
    if(!options.hasOwnProperty('seller')) options.seller = null;
    let endIndex = parseInt(options.count);


    if(options.seller != null){
        let sql = "select auction_id as id,category_title as categoryTitle,auction_categoryid as categoryId,auction_title as title," +
            "auction_reserveprice as reservePrice,auction_startingdate as startDateTime,auction_endingdate as " +
            "endDateTime,max(bid_amount) as currentBid From (auction a LEFT JOIN category c ON a.auction_categoryid = c.category_id) LEFT JOIN" +
            " bid b ON a.auction_id = b.bid_auctionid WHERE auction_userid = ? GROUP BY id"
        db.get_pool().query(sql,[options.seller],function (err,result1) {
            if(err) return done(1);
            done(result1);

        })
    }
    else if(options.bidder != null){
        let sql1 = "select auction_id as id,category_title as categoryTitle,auction_categoryid as categoryId,auction_title as title," +
            "auction_reserveprice as reservePrice,auction_startingdate as startDateTime,auction_endingdate as " +
            "endDateTime,max(bid_amount) as currentBid From (auction a LEFT JOIN category c ON a.auction_categoryid = c.category_id) LEFT JOIN" +
            " bid b ON a.auction_id = b.bid_auctionid WHERE bid_id = ? GROUP BY id"
        db.get_pool().query(sql1,[options.bidder],function (err,result2) {
            if(err) return done(1);
            done(result2);

        })

    }
    else if(options.winner != null){
        let sql2 = "select auction_id as id,category_title as categoryTitle,auction_categoryid as categoryId,auction_title as title," +
            "auction_reserveprice as reservePrice,auction_startingdate as startDateTime,auction_endingdate as " +
            "endDateTime,max(bid_amount) as currentBid From ((auction a LEFT JOIN category c ON a.auction_categoryid = c.category_id) LEFT JOIN" +
            " bid b ON a.auction_id = b.bid_auctionid) left join auction_user on b.bid_userid = auction_user.user_id WHERE user_id = ? and bid_amount >= auction_reserveprice GROUP BY id; "
        db.get_pool().query(sql2,[options.winner],function (err,result3) {
            if(err) return done(1);
            done(result3);
        })
    }
    else if(options.q != null){
        console.log(options.q);
        let sql3 = "SELECT auction_id as id,category_title as categoryTitle,auction_categoryid as categoryId,auction_title as title," +
            "auction_reserveprice as reservePrice,auction_startingdate as startDateTime,auction_endingdate as endDateTime," +
            "max(bid_amount) as currentBid From (auction a LEFT JOIN category c ON a.auction_categoryid = c.category_id) LEFT JOIN bid b ON a.auction_id" +
            "= b.bid_auctionid " +
            "WHERE auction_id >= ? and auction_id < ? and auction_title like ? GROUP BY id;"
        db.get_pool().query(sql3,[options.startIndex,options.count,'%'+options.q+'%'],function(err,result4){
            if (err) return done(1);
            //console.log(result4);

            return done(result4);
        })

    }

    else if (options.category_id != null) {
        console.log(options.category_id);
        let sql4 = "SELECT auction_id as id,category_title as categoryTitle,auction_categoryid as categoryId,auction_title as title," +
            "auction_reserveprice as reservePrice,auction_startingdate as startDateTime,auction_endingdate as endDateTime," +
            "max(bid_amount) as currentBid From (auction a LEFT JOIN category c ON a.auction_categoryid = c.category_id) LEFT JOIN bid b ON a.auction_id" +
            "= b.bid_auctionid " +
            "WHERE category_id = ? group by auction_id LIMIT ?,?"
        db.get_pool().query(sql4, [ options.category_id, options.startIndex, endIndex], function (err, result5) {
            if (err) return done(1);

            return done(result5);
        })

    }
    else {
        //console.log(options.count);
        //console.log(options.startIndex);
        let sql5 = "SELECT auction_id as id,category_title as categoryTitle,auction_categoryid as categoryId,auction_title " +
            "as title, auction_reserveprice as reservePrice,auction_startingdate as startDateTime,auction_endingdate as " +
            "endDateTime,max(bid_amount) as currentBid From (auction a LEFT JOIN category c ON a.auction_categoryid = c.category_id)" +
            " LEFT JOIN bid b ON a.auction_id = b.bid_auctionid group by auction_id LIMIT ?,?"
        db.get_pool().query(sql5,[options.startIndex, endIndex], function (err, result6) {

            if (err) return done(err);


            return done(result6);
        })
    }




    /*let sql = "SELECT auction_id as id,category_title as categoryTitle,auction_categoryid as categoryId,auction_title as title," +
        "auction_reserveprice as reservePrice,auction_startingdate as startDateTime,auction_endingdate as endDateTime," +
        "bid_amount as currentBid From (auction a LEFT JOIN category c ON a.auction_categoryid = c.category_id) LEFT JOIN bid b ON a.auction_id" +
        "= b.bid_auctionid " +
        "WHERE auction_id >=? and auction_id < ?;"

        db.get_pool().query(sql,[options.startIndex,endIndex],function(err,rows){
            if (err) return done({"ERROR":"error selecting"});




            return done(rows);
    });*/
};
exports.createAuctions = function (auction_data,token,done) {
    let user_token = token.toString();



    let sql_selectUid = "SELECT user_id FROM auction_user WHERE user_token = ?";

    db.get_pool().query(sql_selectUid,[user_token],function (err,result) {
        if(err) {return done(1);}
        else{


            let user_id = result[0].user_id;
            // console.log(user_id);
            let dt = dateTime.create();
            let formated = dt.format('y-m-d H:M:S');
            let startDateTime = new Date(parseInt(auction_data.startDateTime));
            let endDateTime = new Date(parseInt(auction_data.endDateTime));
            //let auction_start = auction_data.startDateTime.format('y-m-d H:M:S');



            let values = [[auction_data.categoryId,auction_data.title,auction_data.description,startDateTime,endDateTime,
                auction_data.reservePrice,auction_data.startingBid,user_id,formated]];

            let sql_insertAuction = "INSERT INTO auction (auction_categoryid,auction_title,auction_description,auction_startingdate,auction_endingdate," +
                "auction_reserveprice,auction_startingprice,auction_userid,auction_creationdate) VALUES ?";

            db.get_pool().query(sql_insertAuction,[values],function (err,rows) {
                if(err){return done(1);}
                else{
                    let output = {
                        id: rows.insertId
                    };
                    //console.log(output);
                    done(output);
                };

            });
        };


    });




};
exports.readAuction = function (auction_id,done) {
    //console.log(auction_id);
    //auction_id = 3; test more than one bid
    sql_1 = "SELECT auction_categoryid as categoryId,category_title as categoryTitle,auction_title as title," +
        "auction_reserveprice as reservePrice,auction_startingdate as startDateTime,auction_endingdate as endDateTime," +
        "auction_description as description, auction_creationdate as creationDateTime,auction_startingprice From auction a JOIN category c ON a.auction_categoryid = " +
        "c.category_id WHERE auction_id = ?";
    db.get_pool().query(/*'SELECT * FROM auction WHERE auction_id = ?'*/sql_1,auction_id,function (err,result) {
        if (err) {return done(err);}
        else{
            result = result[0];

            sql_2 = "SELECT auction_userid, user_username from auction a JOIN auction_user u on a.auction_userid = u.user_id WHERE auction_id = ?";
            db.get_pool().query(sql_2,auction_id,function (err,result1) {

                if(err) {return done(err);}
                else {
                    result1 = result1[0];
                    sql_3 = "SELECT bid_amount as amount,bid_datetime as datetime,bid_userid as buyerId,user_username as buyerUsername " +
                        "FROM (auction a  LEFT JOIN bid b ON a.auction_id = b.bid_auctionid)" +
                        "LEFT JOIN auction_user ON b.bid_userid = auction_user.user_id WHERE auction_id = ? ORDER BY bid_datetime desc ";
                    db.get_pool().query(sql_3,auction_id,function (err,result2) {
                        if (err) return done(err);
                        return done({
                            "categoryId": result.categoryId,
                            "categoryTitle": result.categoryTitle,
                            "title": result.title,
                            "reservePrice": result.reservePrice,
                            "startDateTime": result.startDateTime,
                            "endDateTime": result.endDateTime,
                            "description": result.description,
                            "creationDateTime": result.creationDateTime,
                            "seller": {
                                "id": result1.auction_userid,
                                "username": result1.user_username
                            },
                            "startingBid": result.auction_startingprice,
                            "currentBid": result2[0].amount,//select all bids by bid_datetime desc order, the first one amount is current bid
                            "bids": result2
                        });


                    })


                }
            })

        }


    });
};
exports.updateAuction = function (auction_id,auction_data,token,done) {
    // only seller could change the auction details
    //at first check the auction_id and in table
    if (auction_id <= 0) {
        done(3);
    }
    else {

        let sql1 = "select auction_id from auction where auction_id = ?";
        db.get_pool().query(sql1, [auction_id], function (err, result) {
            if (err) return done(err);
            //console.log(result);
            if (result.length == 0) {
                done(4);
            }
            else {
                // check is bid start
                let sql2 = "select bid_id from bid b join auction a on b.bid_auctionid = a.auction_id where auction_id = ?";
                db.get_pool().query(sql2, [auction_id], function (err, result1) {
                    if (err) return done(err);
                    // console.log(result1);
                    if (result1.length > 0) {
                        done(1)
                    }
                    else {
                        //check is the seller
                        let user_token = token.toString();
                        let sql_selectUid = "SELECT user_id FROM auction_user WHERE user_token = ?";
                        db.get_pool().query(sql_selectUid, [user_token], function (err, result2) {
                            if (err) {
                                return done(err);
                            }
                            else {
                                let user_id = result2[0].user_id;
                                // console.log(user_id);
                                let sql3 = "select auction_userid from auction where auction_id = ?";
                                db.get_pool().query(sql3, [auction_id], function (err, result3) {
                                    if (err) {
                                        return done(err);
                                    }
                                    else {

                                        if (result3[0].auction_userid != user_id) {
                                            done(2);
                                        }
                                        else {
                                            //console.log(result3);

                                            // UPDATE INFOMATION
                                            let sql4 = "UPDATE auction SET auction_title = ?,auction_categoryid = ?,auction_description = ?," +
                                                "auction_reserveprice = ?,auction_startingprice = ?,auction_startingdate = ?,auction_endingdate = ?" +
                                                " WHERE auction_id = ?";
                                            db.get_pool().query(sql4, [auction_data.title, auction_data.categoryId,
                                                auction_data.description, auction_data.reservePrice,
                                                auction_data.startingBid, auction_data.startDateTime,
                                                auction_data.endDateTime, auction_id], function (err, result4) {
                                                if (err) {
                                                    return done(err);
                                                }
                                                else {
                                                    return done(result4);
                                                }

                                            });
                                        }
                                    }
                                });


                            }

                        })


                    }


                });

            }


        });

    }
};

exports.getBids = function (auction_id,done) {
    //console.log(auction_id);
    if (auction_id <= 0) {done(1);}

    else{
        let sql = "select bid_amount as amount, bid_datetime as datetime, bid_userid as buyerId, user_username as buyerUsername from " +
            "(bid b left join auction_user u on b.bid_userid = u.user_id ) left join auction on b.bid_auctionid = auction.auction_id where " +
            "auction_id = ?";
        db.get_pool().query(sql, [auction_id], function (err, result) {

            if (err) return done(err);
            if (result.length == 0) {done(2)}


            else
            {

                return done(result);

            }


        })
    }
};

exports.postBids = function (auction_id,amount,token,done) {
    //check auction_id
    if (auction_id <= 0) {return done(1);}
    else{
        //find auction_id
        let sql1 = "select auction_id,auction_endingdate from auction where auction_id = ?";
        db.get_pool().query(sql1,[auction_id],function (err,result) {
            if (err){return done(2)}
            else {console.log(result[0].auction_endingdate);
                if (result.length == 0) {
                    return done(3);
                }
                else {
                    //find user_id
                    //let user_token = token.toString();
                    let sql_selectUid = "SELECT user_id FROM auction_user WHERE user_token = ?";
                    db.get_pool().query(sql_selectUid, [token], function (err, result1) {
                        //console.log(token);
                        if (err) {
                            return done(2)
                        }
                        else {
                            let user_id = result1[0].user_id;
                            // console.log(user_id);
                            //create bid
                            let dt = dateTime.create();
                            let formated = dt.format('y-m-d H:M:S');
                            let sql2 = "INSERT INTO bid (bid_userid,bid_auctionid,bid_amount,bid_datetime) VALUES ?";
                            //done(result1)
                            db.get_pool().query(sql2,[[[user_id,auction_id,amount,formated]]],function (err,result2) {
                                if(err) {return done(err);}
                                else if (result.auction_endingdate > dt){return done(3)}
                                else{ done(result2);}


                            })





                        }

                    })
                }
            }

        })//biaoji


    }
};


exports.reset = function (sql,done) {
    db.get_pool().query(sql,function (err,result) {
        if(err) {return done(1);}
        else{
            done(result)
        }

    })

};
exports.resample = function (sql,done) {
    db.get_pool().query(sql,function (err,result) {
        if(err) {return done(1);}
        else{
            done(result)
        }

    })

};