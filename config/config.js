const convict = require('convict');
//use your database 

let config = convict({
    authToken: {
        format: String,
        default: 'X-Authorization'
    },
    db: {
        host: { // host, rather than hostname, as mysql connection string uses 'host'
            format: String,
            default: "XXXXXXX"
        },
        port:{
            format: Number,
            default: 3306

        },
        user: {
            format: String,
            default: 'XXXX'
        },
        password: {
            format: String,
            default: 'XXXXXX'
        },
        database: {
            format: String,
            default: 'xch75'
        },
        multipleStatements:{
            format: Boolean,
            default: true
        }
    }
});


module.exports = config;
