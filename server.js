// server.js

// set up ========================
var express = require('express');
var fs = require('file-system');
var https = require('https');
var app = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var Grid = require('gridfs-stream');
var shortId = require('shortid');
// var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
// var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// module.exports.init = function(app) {  
var Schema;
var conn;

Grid.mongo = mongoose.mongo;
conn = mongoose.createConnection('mongodb://localhost:27017/html-export');
conn.once('open', function () {
    var gfs = Grid(conn.db);
    app.set('gridfs', gfs);
    // all set!
});

app.set('mongoose', mongoose);
Schema = mongoose.Schema;
// setup the schema for DB
// require('../db/schema')(Schema, app);
//   };

// configuration =================
/** Seting up server to accept cross-origin browser requests */
app.use(function (req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

mongoose.connect('mongodb://localhost:27017/html-export');     // connect to mongoDB database on modulus.io
app.use(express.static(__dirname));                 // set the static files location /public/img will be /img for users

// define model =================
var Todo = mongoose.model('Todo', {
    img: { data: Buffer, contentType: String },
    video: { data: Buffer, contentType: String },
    title: String
});

var system_params = mongoose.model('system_params',
    new Schema({ html: String }),
    'system_params');

// var system_params = mongoose.model('system_params');

// var app = express();
var options = {
    key: fs.readFileSync('./security/server.key'),
    cert: fs.readFileSync('./security/server.crt')
};

app.use('/', express.static('public'));

app.post('/api/imageUpload', function (req, res) {

    var imgPath = req.body.imgPath;
    var videoPath = req.body.videoPath;

    var prepareData = new Todo;
    prepareData.img.data = imgPath;
    prepareData.img.contentType = 'image/png';
    prepareData.video.data = videoPath;
    prepareData.video.contentType = 'video/mp4';
    prepareData.title = req.body.title;
    prepareData.save(function (err, a) {
        if (err) throw err;
        console.error('Image & video saved to mongo');
        Todo.findById(prepareData, function (err, doc) {
            if (err) return next(err);
            res.send({ "title": "data saved successfully" });
        });
    })
});

app.get('/api/getTitle', function (req, res) {

    // use mongoose to get all todos in the database
    Todo.find(function (err, todos) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err);
        res.json(todos); // return all todos in JSON format
    });
});

// create todo and send back all todos after creation
// app.post('/api/addData', function (req, res) {
//     console.log("text on server end :" + req.body.title);
//     // create a todo, information comes from AJAX request from Angular

//     Todo.create({
//         title: req.body.title,
//         done: false
//     }, function (err, todo) {
//         if (err)
//             res.send(err);

//         // get and return all the todos after you create another
//         Todo.find(function (err, todos) {
//             if (err)
//                 res.send(err)
//             res.send("Data Inserted successfully...");
//         });
//     });

// });
app.get("/api/getHtml", function (req, res) {

    var data = {
        obj : ""
    }

    Todo.find({ '_id': req.query.id }, function (err, todos) {
        if (err)
            res.send(err);

        var currentAdObj = JSON.parse(JSON.stringify(todos[0]));
        data.obj = currentAdObj;
        // console.log(todos[0]);
        system_params.find(function (err, resp) {
            var htmlStr = JSON.parse(JSON.stringify(resp[0]));

            data.html = htmlStr.html
            // data.rendered = htmlStr.html.replace(/\$title/g,currentAdObj.title);      
            res.json(data);
        });
        
    });

});

// get the gridfs instance
var gridfs = app.get('gridfs');

// app.post('/api/uploadVideo', function (req, res, next) {
//     var is;
//     var os;
//     //get the extenstion of the file
//     var extension = req.files.file.path.split(/[. ]+/).pop();
//     is = fs.createReadStream(req.files.file.path);
//     os = gridfs.createWriteStream({ filename: shortId.generate() + '.' + extension });
//     is.pipe(os);

//     os.on('close', function (file) {
//         //delete file from temp folder
//         fs.unlink(req.files.file.path, function () {
//             res.json(200, file);
//         });
//     });
// });

// conn.system_params.find(function(err, res){
//     console.log(res);
// });

// delete a todo
// app.delete('/api/todos/:todo_id', function (req, res) {
//     Todo.remove({
//         _id: req.params.todo_id
//     }, function (err, todo) {
//         if (err)
//             res.send(err);

//         // get and return all the todos after you create another
//         Todo.find(function (err, todos) {
//             if (err)
//                 res.send(err)
//             res.json(todos);
//         });
//     });
// });

// application -------------------------------------------------------------
app.get('/index', function (req, res) {
    res.sendfile('./index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

var server = https.createServer(options, app).listen(3000, function () {
    console.log("server started at port 3000");
});

    // listen (start app with node server.js) ======================================
    // app.listen(3000);    // console.log("App listening on port 3000");