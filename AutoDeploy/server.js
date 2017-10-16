//'use strict';
//var http = require('http');
var port = process.env.PORT || 1337;
//http.createServer(function (req, res) {
//    res.writeHead(200, { 'Content-Type': 'text/plain' });
//    res.end('Hello World\n');
//}).listen(port);
var express = require('express');
var app = express();

var fs = require('fs');
var bodyParser = require('body-parser');
var unzip = require('unzip');
var fileUpload = require('express-fileupload');
var mkdirp = require('mkdirp');

//app.use(bodyParser.urlencoded({ extended: false }));

var path = require('path');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
//var multer = require('multer');
//var autoReap = require('multer-autoreap');

//To extract the uploaded zip file
app.post('/upload', multipartMiddleware, function (req, res) {
    var actualpath = req.files.zipFile.path;

    var extractPath = req.body.extractPath;

    //Declare the path as static to access files from browser
    app.use(express.static('public'));
    app.use(express.static('Html'));
    app.use('/' + extractPath, express.static(extractPath));
    var readChunk = require('read-chunk');
    var fileType = require('file-type');

    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    var zipFileName = req.files.zipFile.name;
    var fName = zipFileName.substring(0, zipFileName.indexOf("."));

    var ftype = fileType(readChunk.sync(actualpath, 0, 4100));
    if (ftype.ext === 'zip' || ftype.ext === 'rar') {
        //Extract if Path/Directory already exists
        if (fs.existsSync(extractPath)) {
            fs.createReadStream(actualpath).pipe(unzip.Extract({ path: extractPath }));
            res.send('<p>Directory Exists: Extracted Successfully.</p> <p> Path:- http://localhost:' + port + '\/' + extractPath + '\/' + fName + '\/..</p>');
        }
        else {
            //Create Path/Directory and then Extract
            mkdirp(extractPath, function (err) {
                if (err)
                    res.send(err);
                else {
                    fs.createReadStream(actualpath).pipe(unzip.Extract({ path: extractPath }));
                    res.send('<p>Directory Created: Extracted Successfully.</p> <p> Path:- http://localhost:' + port + '\/' + extractPath + '\/' + fName + '\/..</p>');
                }
            });
        }
    }
    else {
        res.send('<p>Please upload zipped files with extension .zip or .rar</p>');
    }

    res.on('finish', function () {
        fs.unlink(actualpath);
    });
});


//Page to enter Path, Upload File and Submit.
app.get('/', function (req, res) {
    res.sendFile(path.resolve('index.html'));
});

app.use(fileUpload());

var server = app.listen(port, function () {
    console.log('Node server is running on' + port);
});