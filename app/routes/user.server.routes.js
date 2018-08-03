const users = require('../controllers/user.server.controller');
const myMiddleware = require('../middlewares/jwtMiddleware');

module.exports = function(app){
    app.route('/api/v1/users')
        .get(users.list)
        .post(users.create);
    app.route('/api/v1/users/login')
        .post(users.login);
    app.route('/api/v1/users/:id')
        .get(myMiddleware.myMiddleware,users.read)
        .patch(myMiddleware.myMiddleware,users.update);

    app.route('/api/v1/users/logout')
        .post(myMiddleware.myMiddleware,users.logout);

};