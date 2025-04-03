const authRouter = require('./auth');
const productRouter = require('./product');
const accountRouter = require('./account');
const adminRouter = require('./admin');
const customerRouter = require('./customer')
const orderRouter = require('./order')

//Authentication
const authenticateJWT = require('../app/middlewares/jwtAuthencation');

//request change password
const handleChangePassword = require('../app/middlewares/handleChangePassword');

function route(app) {
    app.use('/auth', authRouter);
    app.use(authenticateJWT);
    app.use(handleChangePassword);
    //
    app.use('/admin', adminRouter)
    
    //app.use('/account', accountRouter);
    // app.use('/customer', customerRouter);

    //api
    app.use('/api/auth', authRouter);
    app.use('/api/user', accountRouter);
    app.use('/api/product', productRouter);
    app.use('/api/customer', customerRouter);
    app.use('/api/order', orderRouter);


}

module.exports = route;