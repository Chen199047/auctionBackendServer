const
    db = require('./config/db'),
    express = require('./config/express');
const app = express();


db.connect(function(err){
    if(err){
        console.log('unable to connect mysql');
        process.exit(1);
    }else{
        app.listen(4941,function(){
            console.log('listen on port 4941');
        });
    }
});
