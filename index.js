const express = require('express')
const app = express();
const port = 3000;
var session = require("express-session"),
bodyParser = require("body-parser");
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
app.use(express.static("public"));
app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));
const files2 = [];
const path = require('path');
const fs = require('fs');
//joining path of directory 
const directoryPath = path.join(__dirname, 'public/data');
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        //console.log(file); 
        files2.push(file);
    });
});


const GITHUB_CLIENT_ID = '816930a170c61cfab482';
const GITHUB_CLIENT_SECRET = '2dfe714d91f6cba820bb92da2b932873d31810ae';

const fbid = '410245020774113';
const fbsec ='9e1f0927955ab78ad20e879141af202a';


const tid = 'aUXnTdtWOvrYnMf0E2Wx0Jm8F';
const tsec = 'lpXkq3euCl7eTbXxoNVrK0I7oWMCB8pNE7rep4gn2pL9c0ViOV';

const cache= new Map();
const roles= new Map();

passport.serializeUser(function (user, done) {
    cache.set(user.id,user.displayName);
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
    callbackURL: "http://127.0.0.1:3000/auth/github/callback",
    failureRedirect: '/login'
},
    function (accessToken, refreshToken, profile, done) {
        // User.findOrCreate({ githubId: profile.id }, function (err, user) {
        //     return done(err, user);
        // });
        return done(null,profile);
    }
));


passport.use(new FacebookStrategy({
    clientID: fbid,
    clientSecret: fbsec,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function (accessToken, refreshToken, profile, done) {
    // User.findOrCreate({ githubId: profile.id }, function (err, user) {
    //     return done(err, user);
    // });
    return done(null,profile);
}
));

passport.use(new TwitterStrategy({
    consumerKey: tid,
    consumerSecret: tsec,
    callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, cb) {
    // User.findOrCreate({ twitterId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
    return cb(null,profile);
  }
));

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

app.get('/', function (req, res) {
    res.render('login', { title: 'Login', message: 'Login below!' })
})

app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/twitter');
  });

  app.get('/github', function (req, res) {
    if(req.user && cache.has(req.user)){
        let a = cache.get(req.user);
        if(a && a!=null){
            res.render('github', { title: 'Patient', message: `Welcome ${a} (Patient)!` });
            return;
        }
    }
    res.redirect('/'); 
    
})

app.get('/facebook', function (req, res) {
    if(req.user && cache.has(req.user)){
        let a = cache.get(req.user);
        if(a && a!=null){
            var html = getFiles();
            res.render('facebook', { title: 'Researcher', message: `Welcome ${a} (Researcher)!`, files: html });
            return;
        }
    }
    res.redirect('/'); 
})

function getFiles(){
    var html = "<h3>Patient Files</h3><br/>";
    for(let f of files2){
        let b = `<a href="${'/data/'+f}"> ${f}</a><br/>`;
        html = html + ""+ b;
    }
    return html;
}

app.get('/twitter', function (req, res) {
    if(req.user && cache.has(req.user)){
        let a = cache.get(req.user);
        if(a && a!=null){
            var html = getFiles();
            res.render('twitter', { title: 'Physician', message: `Welcome ${a} (Physician)!`, files: html });
            return;
        }
    }
    res.redirect('/'); 
})

app.get('/:name/download', function (req, res, next) {
    var filePath = "/public/data/";
    var fileName = "name";

    res.download(filePath, fileName);    
});



app.get('/logout', function(req, res){
    req.logout();
    req.sessionID = null;
    cache.set(req.user,null);
    res.redirect('/');
  });

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
  })