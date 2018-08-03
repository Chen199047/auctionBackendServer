const convict = require('convict');

let config = convict({
    authToken: {
        format: String,
        default: 'X-Authorization'
    },
    db: {
        host: { // host, rather than hostname, as mysql connection string uses 'host'
            format: String,
            default: "13.211.77.143"
        },
        port:{
            format: Number,
            default: 3306

        },
        user: {
            format: String,
            default: 'xch75'
        },
        password: {
            format: String,
            default: '31933301'
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