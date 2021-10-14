const port = 3000;

const express = require('express')
const mysql = require('mysql2');
var session = require("express-session"),
    bodyParser = require("body-parser");
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

const app = express();
app.use(session({
    secret: "dobisteinMAnn",
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));


const appConfig = require('./config.json');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID == undefined ? appConfig.GITHUB_CLIENT_ID : process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET == undefined ? appConfig.GITHUB_CLIENT_SECRET : process.env.GITHUB_CLIENT_SECRET;
const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID == undefined ? appConfig.FACEBOOK_CLIENT_ID : process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET == undefined ? appConfig.FACEBOOK_CLIENT_SECRET : process.env.FACEBOOK_CLIENT_SECRET;
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID == undefined ? appConfig.TWITTER_CLIENT_ID : process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET == undefined ? appConfig.TWITTER_CLIENT_SECRET : process.env.TWITTER_CLIENT_SECRET;
const GITHUB_CALLBACK = process.env.GITHUB_CALLBACK == undefined ? appConfig.GITHUB_CALLBACK : process.env.GITHUB_CALLBACK;
const FACEBOOK_CALLBACK = process.env.FACEBOOK_CALLBACK == undefined ? appConfig.FACEBOOK_CALLBACK : process.env.FACEBOOK_CALLBACK;
const TWITTER_CALLBACK = process.env.TWITTER_CALLBACK == undefined ? appConfig.TWITTER_CALLBACK : process.env.TWITTER_CALLBACK;

// const path = require('path');
// const fs = require('fs');
//joining path of directory 
//const directoryPath = path.join(__dirname, 'public/data');
//passsing directoryPath and callback function
// fs.readdir(directoryPath, function (err, files) {
//     //handling error
//     if (err) {
//         return console.log('Unable to scan directory: ' + err);
//     }
//     //listing all files using forEach
//     files.forEach(function (file) {
//         //console.log(file); 
//         files2.push(file);
//     });
// });

const cache = new Map();
passport.serializeUser(function (user, done) {
    cache.set(user.id, user.displayName == null ? user.username : user.displayName);
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    // User.findById(id, function (err, user) {
    //     done(err, user);
    // });
    done(null, id);
});

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK,
    failureRedirect: '/login'
},
    function (accessToken, refreshToken, profile, done) {
        // User.findOrCreate({ githubId: profile.id }, function (err, user) {
        //     return done(err, user);
        // });
        return done(null, profile);
    }
));


passport.use(new FacebookStrategy({
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: FACEBOOK_CALLBACK
},
    function (accessToken, refreshToken, profile, done) {
        // User.findOrCreate({ githubId: profile.id }, function (err, user) {
        //     return done(err, user);
        // });
        return done(null, profile);
    }
));

passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CLIENT_ID,
    consumerSecret: TWITTER_CLIENT_SECRET,
    callbackURL: TWITTER_CALLBACK
},
    function (token, tokenSecret, profile, cb) {
        // User.findOrCreate({ twitterId: profile.id }, function (err, user) {
        //   return cb(err, user);
        // });
        return cb(null, profile);
    }
));

app.get('/', function (req, res) {
    res.render('login', { title: 'Login', message: 'Login below!' })
})

app.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/github');
    });

app.get('/auth/facebook',
    passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/facebook');
    });

app.get('/auth/twitter',
    passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/twitter');
    });

app.get('/github', function (req, res) {
    if (req.user && cache.has(req.user)) {
        let a = cache.get(req.user);
        if (a && a != null) {
            res.render('github', { title: 'Patient', message: `Welcome ${a} (Patient)!` });
            return;
        }
    }
    res.redirect('/');

})

app.get('/facebook', function (req, res) {
    if (req.user && cache.has(req.user)) {
        let a = cache.get(req.user);
        if (a && a != null) {
            connection.query(`select ts.dataURL,p.username from Test_Session ts, Test t, Therapy th, User p, User m  where ts.test_SessionID=t.testID and t.Therapy_IDtherapy=th.therapyID and USer_IDmed=m.userID and User_IDpatient=p.userID and m.username='${a}';`, function (err, rows, fields) {
                if (err) throw err;

                res.render('facebook', { title: 'Researcher', message: `Welcome ${a} (Researcher)!`, files: getFiles2(rows) });
            })
        } else {
            res.render('facebook', { title: 'Researcher', message: `Welcome! (Researcher)!`, files: [] });
        }
    } else {
        res.render('404',{title: 'Error', message: 'No data found on account.'});
    }
})

app.get('/twitter', function (req, res) {
    if (req.user && cache.has(req.user)) {
        let a = cache.get(req.user);
        if (a && a != null) {
            connection.query(`select ts.dataURL,p.username from Test_Session ts, Test t, Therapy th, User p, User m  where ts.test_SessionID=t.testID and t.Therapy_IDtherapy=th.therapyID and USer_IDmed=m.userID and User_IDpatient=p.userID and m.username='${a}';`, function (err, rows, fields) {
                if (err) throw err;

                res.render('twitter', { title: 'Physician', message: `Welcome ${a} (Physician)!`, files: getFiles2(rows) });
            });
        }else{
            res.render('twitter', { title: 'Physician', message: `Welcome (Physician)!`, files: [] });
        }
    }else{
        res.render('404',{title: 'Error', message: 'No data found on account.'});
    }
})


app.get('/logout', function (req, res) {
    req.logout();
    req.sessionID = null;
    cache.set(req.user, null);
    res.redirect('/');
});
// function getFiles() {
//     var html = "<h3>Patient Files</h3><br/>";
//     for (let f of files2) {
//         let b = `<a href="${'/data/' + f}"> ${f}</a><br/>`;
//         html = html + "" + b;
//     }
//     return html;
// }
function getFiles2(files) {
    var html = "<h3>Patient Files</h3><br/>";
    if (files.length == 0) {
        html = html + "<p>No patients' data found!</p>";
    } else {
        for (let f of files) {
            let b = `<b>${f.username}: </b><a href="${'/data/' + f.dataURL + ".csv"}"> ${f.dataURL}</a><br/>`;
            html = html + "" + b;
        }
    }
    return html;
}

const connection = mysql.createConnection(appConfig.db);
connection.connect((err) => {
    if (err) throw err;
    console.log('Database Connected!');
});

app.get('/db/:table', function (req, res) {
    connection.query(`SELECT * from ${table}`, function (err, rows, fields) {
        if (err) throw err
        res.json(rows);
    })
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})