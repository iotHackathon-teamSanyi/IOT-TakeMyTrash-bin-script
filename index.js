//GENERAL VARIABLES
var counter = 0;
var lastTime = 0;
var timeout;
var isReady = false;

//GPIO INFRARED VARIABLES
var Gpio = require('onoff').Gpio;
var ir = new Gpio(4, 'in', 'both');

//SOCKET IO VARIABLES
var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('index2.html');

//SOCKET IO SERVER START HERE
var app = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(index);
    console.log('New connection established...');
});
	app.listen(3000);

var io = require('socket.io').listen(app);
	io.on('connection', function(socket) {
	    sendTrashCount(counter);
	});


// GPIO INFRARED SENSOR START HERE
ir.watch(function(err, value) {
    if (err) throw err;

    if (value == 1) {
        var currentTime = Date.now();
        if (currentTime > lastTime + 500) { //repeat time
            counter++;
	    console.log(counter);
            debounce(3000, function() { //wait after last drop
                sendTrashCount(counter);
		counter=0;

            });
            lastTime = currentTime;
        }
    }
});

function sendTrashCount(counter) {
    console.log("Data sent to the server.");
var trashId=1;
    var optionsget = {
        host: 'takemytrash.westeurope.cloudapp.azure.com',
        port: 80,
        path: '/trashevent/' + counter + '/'+trashId,
        method: 'GET'
    };

    var reqGet = http.request(optionsget, function(res) {
        res.on('data', function(d) {
            const buff = new Buffer(d);
            var data = buff.toString();
	console.log(data);
            io.emit('msg', data);
        });
    });
    reqGet.end();
    reqGet.on('error', function(e) {
        console.error(e);
    });
}

//SEND MY ID TO THE SERVER
function theRealSlimShady() {
	var myIp = "169.254.104.124";
	var myPort = "3000";
	isReady = true;
}

//HELPERS
function debounce(time, cb) {
    clearTimeout(timeout);
    timeout = setTimeout(function() {
        cb();
    }, time);
}

//DESTRUCT
process.on('SIGINT', function() {
    console.log('Bye bye...');
    ir.unexport();
    process.exit();
});

//INITIALIZE
theRealSlimShady();
console.log('Server initialized...');
