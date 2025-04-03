const express = require('express');
const cors = require('cors');
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const route = require('./routes');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// connect db
db.connect();

///middleware
app.use(cors());
// override with POST having /link?_method=DELETE --> router app.delete
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(expressSession({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));

//engine
app.engine('.hbs', handlebars.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        formatDate: function (date) {
            const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            return new Date(date).toLocaleString('en-US', options);
        },
        formatPrice(price) {
            price = Number(price).toFixed(0);
            let chars = price.split("");
            let len = chars.length;
            let dots = Math.floor((len - 1) / 3);
            for (let i = 1; i <= dots; i++) {
                chars.splice(len - i * 3, 0, ".");
            }
            return chars.join("");
        },
        id5(id) {
            return id.substr(-5)
        },
        multiply(a, b) {
            return a * b
        },
        inObjectService(stt, arr) {
            return arr.some(obj => obj.stt == stt)
        },
        ne: (v1, v2) => v1 !== v2
        ,
        eq: (v1, v2) => v1 === v2
        ,
        ifEquals: function (arg1, arg2, options) {
            return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
        },
        sum: (a, b) => a + b
    },
}));

//set view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    res.locals.flash = req.session.flash;
    res.locals.isChangePass = "false";
    if (req.session.isChangePass) {
        res.locals.isChangePass = "true";
    }
    delete req.session.flash;
    next();
});

//routes init
route(app);

app.use(function (req, res, next) {
    res.status(404).render('error');
});

//listeners
app.listen(PORT, () => { console.log(`Server running at http://localhost:${PORT}/`); });
