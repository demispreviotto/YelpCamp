if (process.env.NODE_ENV !== "production") {
    require('dotenv').config(); //npm i dotenv
}

const express = require('express'); //nmp i express
const path = require('path');
const mongoose = require('mongoose'); //nmp i mongoose
const ejsMate = require('ejs-mate'); //nmp i ejs-mate
const session = require('express-session'); //nmp i express-session
const flash = require('connect-flash'); //nmp i connect-flash
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override'); //nmp i method-override
const passport = require('passport'); //npm i passport passport-local passport-local-mongoose
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const helmet = require('helmet');//npm i helmet
const mongoSanitize = require('express-mongo-sanitize'); //npm i express-mongo-sanitize

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require("connect-mongo");//npm i connect-mongo

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database conected");
})

const app = express();

app.engine('ejs', ejsMate);
app.set("view engine", 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',//change the default name of connect session ID so it cant be easy to find
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //only this http have acces to the cookies
        //secure: true //to change when deploy
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({
    crossOriginEmbedderPolicy: false
}));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    // "https://res.cloudinary.com/"
];
const styleSrcUrls = [
    // "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/d98ebb3866bffe843fd25967e3256e025/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session()); //make sure that session is use before password.session
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    // console.log(req.session)
    res.locals.currentUser = req.user; //access currentUser from all templates
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'coltttt@gmail.com', username: 'colttt' });
//     const newUser = await User.register(user, 'chicken');
//     res.send(newUser);
// })

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong!!';
    res.status(statusCode).render('error', { err });
});

// app.listen(8080, () => {
//     console.log('Serving on port 8080')
// });
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Servin at http://localhost:${port}`)
})