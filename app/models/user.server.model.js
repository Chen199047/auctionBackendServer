
const db = require('../../config/db');

exports.getAll = function(done){
    db.get_pool().query('SELECT * FROM auction_user', function(err,rows){
        if (err) return done({"ERROR":"error selecting"});
        return done(rows);
    });
};

exports.getOne = function(user_id,done){
    db.get_pool().query('SELECT * FROM auction_user WHERE user_id = ?',user_id,function (err,result) {
        if (err) return done(err);
        done(result);

    });

};
exports.insert = function(username, done){
    let values = [username];
    db.get_pool().query('INSERT INTO auction_user (user_username,user_givenname,user_familyname,' +
        'user_email,user_password) VALUES ?',values,function (err,result) {
        if (err) return done(1);
        let output = {
            id: result.insertId
        }

        done(output);


    });

};
exports.alter = function(user_id,user_data,done){

    let sql = "UPDATE `auction_user` SET `user_givenname` ='"+user_data.user_givenname+"',`user_familyname` =" +
        "'"+user_data.user_familyname+"' " +
        "WHERE `user_id`='"+user_id+"'";

    db.get_pool().query(sql,function (err,rows) {
        if (err) return done(1);

        done(rows);

    });

};
exports.remove = function(token,done){
    //remove token
    let sql = "UPDATE auction_user SET user_token = ? WHERE user_token = ?";
    db.get_pool().query(sql,[null,token],function (err,rows) {
        if(err) {return done(1);}
        else{
            return done(rows);
        }

    })

};
exports.loginUser = function(values,token,done){
    let sql = "SELECT user_id, user_username FROM `auction_user` WHERE `user_username`='"+values.user_username+"' or user_email = '"+values.user_email+"' and user_password = '"+values.user_password+"'";

    db.get_pool().query(sql,function (err,result) {
        if (err) {return done(1);}

        else if(result.length == 0){ return done(1);}
        else {


            let user_id = result[0].user_id;
            //console.log(user_id);

            let sql_2 = "UPDATE `auction_user` SET `user_token` ='" + token + "' WHERE `user_id`='" + user_id + "'";
            db.get_pool().query(sql_2, function (err, rows) {
                if (err) return done(1);
                let output = {
                    id: user_id,
                    token: token
                }
                return done(output);

            });


        }

    });


};
exports.getIdFromToken = function(token, done){
    if (token === undefined || token === null)
        return done(true, null);
    else {
        db.get_pool().query(
            'SELECT user_id FROM auction_user WHERE user_token=?',
            [token],
            function(err, result){
                if (result.length === 1)
                    return done(null, result[0].user_id);
                return done(err, null);
            }
        )
    }
};