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
        res.render('404', { title: 'Error', message: 'No data found on account.' });
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
        } else {
            res.render('twitter', { title: 'Physician', message: `Welcome (Physician)!`, files: [] });
        }
    } else {
        res.render('404', { title: 'Error', message: 'No data found on account.' });
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
    if (err) {
        console.log('Could not connect to database!');
    }else{
        console.log('Database Connected!');
    }
});

app.get('/db/:table', function (req, res) {
    connection.query(`SELECT * from ${req.params.table}`, function (err, rows, fields) {
        if (err) throw err
        res.json(rows);
    })
});

const { JSDOM } = require('jsdom');

app.get('/spiral', function(req,res){
        res.sendFile('public/spiral/index.html', { root: __dirname });
});

app.get('/tap', function(req,res){
    res.sendFile('public/tap/index.html', { root: __dirname });
});


app.get('/geo', function(req,res){
    res.sendFile('public/geo.html', { root: __dirname });
});



// app.get('/graph', async function (req, res) {
//     var d3 = await import('d3');
//     {
//         try {
//             let body = plotSpiral(d3);

//         // body.append("svg")
//         //     .attr("version", "1.1")
//         //     .attr("xmlns", d3.namespaces.svg)
//         //     .attr("xmlns:xlink", d3.namespaces.xlink)
//         //     .attr("width", 1000)
//         //     .attr("height", 500)
//         //     .attr("viewBox", "0 0 " + width + " " + height);

//         //process.stdout.write(body.node().innerHTML);
//         res.render('graph', { title: 'Researcher', message: `Welcome (Researcher)!`, graph: body.node().innerHTML });
//         } catch (error) {
//             res.render('graph', { title: 'Researcher', message: `Welcome (Researcher)!`, graph: 'could not draw graph!' });
//         }
        
//     }//);
// });

function plotSpiral(d3) {

    CreateSVG(d3);
    let { document } = (new JSDOM('')).window;
    let body = d3.select(document).select('body');
    var xmlns = "http://www.w3.org/2000/svg";
    // var boxWidth = 500;
    // var boxHeight = 500;

    // var svgElem = document.createElementNS(xmlns, "svg");
    // svgElem.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
    // svgElem.setAttributeNS(null, "width", boxWidth);
    // svgElem.setAttributeNS(null, "height", boxHeight);
    // svgElem.style.display = "block";

    // var g = document.createElementNS(xmlns, "g");
    // svgElem.appendChild(g);
    // g.setAttributeNS(null, 'transform', "translate(" + boxWidth / 2 + "," + boxHeight / 2 + ")");

    var width = 500,
        height = 500,
        start = 0,
        end = 2.25,
        numSpirals = 3
    margin = { top: 50, bottom: 50, left: 50, right: 50 };

    var theta = function (r) {
        return numSpirals * Math.PI * r;
    };

    // used to assign nodes color by group
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var r = d3.min([width, height]) / 2 - 40;

    var radius = d3.scaleLinear()
        .domain([start, end])
        .range([40, r]);

    var svg = body.append("svg")
        .attr("version", "1.1")
        .attr("xmlns", d3.namespaces.svg)
        .attr("xmlns:xlink", d3.namespaces.xlink)
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var points = d3.range(start, end + 0.001, (end - start) / 1000);

    var spiral = d3.radialLine()
        .curve(d3.curveCardinal)
        .angle(theta)
        .radius(radius);

    // var path = document.createElementNS(xmlns, "path");
    // path.setAttributeNS(null,"id","spiral");
    // path.setAttributeNS(null, 'stroke', "steelblue");
    // //path.setAttributeNS(null, 'stroke-width', 10);
    // //path.setAttributeNS(null, 'stroke-linejoin', "round");
    // path.setAttributeNS(null, 'd', spiral);
    // path.setAttributeNS(null, 'fill', "none");
    // path.dataset = [points];
    // //path.setAttributeNS(null, 'opacity', 1.0);


    var path = svg.append('path')
        .datum(points)
        .attr("id", "spiral")
        .attr("d", spiral)
        .style("fill", "none")
        .style("stroke", "steelblue");

    //svg._groups[0][0].appendChild(path);
    //svg.appendChild(path);

    var spiralLength = path.node().getTotalLength(),
        N = 365,
        barWidth = (spiralLength / N) - 1;
    var someData = [];
    for (var i = 0; i < N; i++) {
        var currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + i);
        someData.push({
            date: currentDate,
            value: Math.random(),
            group: currentDate.getMonth()
        });
    }

    var timeScale = d3.scaleTime()
        .domain(d3.extent(someData, function (d) {
            return d.date;
        }))
        .range([0, spiralLength]);

    // yScale for the bar height
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(someData, function (d) {
            return d.value;
        })])
        .range([0, (r / numSpirals) - 30]);

    svg.selectAll("rect")
        .data(someData)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {

            var linePer = timeScale(d.date),
                posOnLine = path.node().getPointAtLength(linePer),
                angleOnLine = path.node().getPointAtLength(linePer - barWidth);

            d.linePer = linePer; // % distance are on the spiral
            d.x = posOnLine.x; // x postion on the spiral
            d.y = posOnLine.y; // y position on the spiral

            d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

            return d.x;
        })
        .attr("y", function (d) {
            return d.y;
        })
        .attr("width", function (d) {
            return barWidth;
        })
        .attr("height", function (d) {
            return yScale(d.value);
        })
        .style("fill", function (d) { return color(d.group); })
        .style("stroke", "none")
        .attr("transform", function (d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        });

    // add date labels
    var tF = d3.timeFormat("%b %Y"),
        firstInMonth = {};

    svg.selectAll("text")
        .data(someData)
        .enter()
        .append("text")
        .attr("dy", 10)
        .style("text-anchor", "start")
        .style("font", "10px arial")
        .append("textPath")
        // only add for the first of each month
        .filter(function (d) {
            var sd = tF(d.date);
            if (!firstInMonth[sd]) {
                firstInMonth[sd] = 1;
                return true;
            }
            return false;
        })
        .text(function (d) {
            return tF(d.date);
        })
        // place text along spiral
        .attr("xlink:href", "#spiral")
        .style("fill", "grey")
        .attr("startOffset", function (d) {
            return ((d.linePer / spiralLength) * 100) + "%";
        })


    var tooltip = d3.select("#chart")
        .append('div')
        .attr('class', 'tooltip');

    tooltip.append('div')
        .attr('class', 'date');
    tooltip.append('div')
        .attr('class', 'value');

    svg.selectAll("rect")
        .on('mouseover', function (d) {

            tooltip.select('.date').html("Date: <b>" + d.date.toDateString() + "</b>");
            tooltip.select('.value').html("Value: <b>" + Math.round(d.value * 100) / 100 + "<b>");

            d3.select(this)
                .style("fill", "#FFFFFF")
                .style("stroke", "#000000")
                .style("stroke-width", "2px");

            tooltip.style('display', 'block');
            tooltip.style('opacity', 2);

        })
        .on('mousemove', function (d) {
            tooltip.style('top', (d3.event.layerY + 10) + 'px')
                .style('left', (d3.event.layerX - 25) + 'px');
        })
        .on('mouseout', function (d) {
            d3.selectAll("rect")
                .style("fill", function (d) { return color(d.group); })
                .style("stroke", "none")

            tooltip.style('display', 'none');
            tooltip.style('opacity', 0);
        });

    return body;
}

function CreateSVG(d3) {
    let { document } = (new JSDOM('')).window;
    var xmlns = "http://www.w3.org/2000/svg";

    var boxWidth = 500,
    boxHeight = 500,
        start = 0,
        end = 2.25,
        numSpirals = 3
    margin = { top: 50, bottom: 50, left: 50, right: 50 };

    var theta = function (r) {
        return numSpirals * Math.PI * r;
    };

    // used to assign nodes color by group
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var r = d3.min([boxWidth, boxHeight]) / 2 - 40;

    var radius = d3.scaleLinear()
        .domain([start, end])
        .range([40, r]);

    var svgElem = document.createElementNS(xmlns, "svg");
    svgElem.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
    svgElem.setAttributeNS(null, "width", boxWidth);
    svgElem.setAttributeNS(null, "height", boxHeight);
    //svgElem.style.display = "block";

    var g = document.createElementNS(xmlns, "g");
    svgElem.appendChild(g);
    g.setAttributeNS(null, 'transform', "translate(" + boxWidth / 2 + "," + boxHeight / 2 + ")");

    var points = d3.range(start, end + 0.001, (end - start) / 1000);

    var spiral = d3.radialLine()
        .curve(d3.curveCardinal)
        .angle(theta)
        .radius(radius);

    // draw linear gradient
    // var defs = document.createElementNS(xmlns, "defs");
    // var grad = document.createElementNS(xmlns, "linearGradient");
    // grad.setAttributeNS(null, "id", "gradient");
    // grad.setAttributeNS(null, "x1", "0%");
    // grad.setAttributeNS(null, "x2", "0%");
    // grad.setAttributeNS(null, "y1", "100%");
    // grad.setAttributeNS(null, "y2", "0%");
    // var stopTop = document.createElementNS(xmlns, "stop");
    // stopTop.setAttributeNS(null, "offset", "0%");
    // stopTop.setAttributeNS(null, "stop-color", "#ff0000");
    // grad.appendChild(stopTop);
    // var stopBottom = document.createElementNS(xmlns, "stop");
    // stopBottom.setAttributeNS(null, "offset", "100%");
    // stopBottom.setAttributeNS(null, "stop-color", "#0000ff");
    // grad.appendChild(stopBottom);
    // defs.appendChild(grad);
    // g.appendChild(defs);

    // // draw borders
    // var coords = "M 0, 0";
    // coords += " l 0, 300";
    // coords += " l 300, 0";
    // coords += " l 0, -300";
    // coords += " l -300, 0";

    var path = document.createElementNS(xmlns, "path");
    //path.setAttributeNS(null, 'stroke-width', 10);
    //path.setAttributeNS(null, 'stroke-linejoin', "round");
    path.setAttributeNS(null, 'id', "spiral");
    path.setAttributeNS(null, 'd', spiral);
    path.setAttributeNS(null, 'fill', "none");
    path.setAttributeNS(null, 'stroke', "steelblue");
    //path.setAttributeNS(null, 'opacity', 1.0);
    let gg = d3.select(document).select('#spiral').datum(points);
    g.appendChild(path);
    let b = gg.node();
    let a = path.node();
    

    var svgContainer = document.getElementById("svgContainer");
    svgContainer.appendChild(svgElem);
}

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})