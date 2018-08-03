const mysql = require('mysql');

const config = require('./config.js');

let state = {
    pool: null
};

exports.connect = function(done){
    state.pool = mysql.createPool(config.get('db'));
    done();
};

exports.get_pool = function(){
    return state.pool;
};
/*let state = {
    pool: null
};
exports.connect = function(done){
    state.pool = mysql.createPool({
        multipleStatements:true,
        host: 'c2-52-63-197-248.ap-southeast-2.compute.amazonaws.com/phpmyadmin',
        port: 3306,
        user: 'phpmyadmin',
        password: 'phpadmin',
        database: 'XCH75'
    });
    done();
};

exports.get_pool = function(){
    return state.pool;
};*/