const auctions = require('../controllers/auctions.server.controller');
const myMiddleware = require('../middlewares/jwtMiddleware');



module.exports = function(app){
    app.route('/api/v1/auctions')
        .get(auctions.list)
        .post(myMiddleware.myMiddleware,auctions.create);
    app.route('/api/v1/auctions/:id')
        .get(auctions.read)
        .patch(myMiddleware.myMiddleware,auctions.update);
    app.route('/api/v1/auctions/:id/bids')
        .get(auctions.readBids)
        .post(myMiddleware.myMiddleware,auctions.createBids);
    app.route('/api/v1/auctions/:id/photos')
        .get(auctions.getPhoto)
        .post(myMiddleware.myMiddleware,auctions.createPhoto)
        .delete(myMiddleware.myMiddleware,auctions.removePhoto);
    app.route('/api/v1/reset')
        .post(auctions.reset);
    app.route('/api/v1/resample')
        .post(auctions.resample);

};