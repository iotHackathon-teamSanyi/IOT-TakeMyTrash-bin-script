//GPIO INFRARED VARIABLES

var Gpio = require('onoff').Gpio;
var ir = new Gpio(4, 'in', 'both');
var counter = 0;
var lastTime = 0;
var timeout;

//SOCKET IO VARIABLES

var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('index.html');

//SOCKET IO SERVER START HERE

var app = http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(index);
        console.log('Connection...');
});
app.listen(3000);

var io = require('socket.io').listen(app);
io.on('connection', function(socket) {
	apiCall(counter);
	//io.emit('msg', dataToSend);
});

// GPIO INFRARED SENSOR START HERE

ir.watch(function(err, value){
	if(err) throw err;

	if (value==1) {
		var currentTime = Date.now();
		if(currentTime > lastTime + 500){            //repeat time
			counter++;
			console.log(counter);
			debounce(1000, function(){          //wait after last drop to do this
				//Do the api call, and emit the return value
				//http://sanyiubuntu.westeurope.cloudapp.azure.com/trashevent
				apiCall(counter);
				//console.log("datatosend" + dataToSend);
				//io.emit('msg', dataToSend);
				//console.log("SEND DATA");
			});
			lastTime = currentTime;
		}
	}
});

function apiCall(counter){
	var optionsget = {
	    host : 'sanyiubuntu.westeurope.cloudapp.azure.com',
	    port : 80,
	    path : '/trashevent/'+counter,
	    method : 'GET'
	};

	var reqGet = http.request(optionsget, function(res) {
	    res.on('data', function(d) {
	        console.log("DATA PURE:" + d);
	        const buff = new Buffer(d);

	        var data = buff.toString();
		console.log("SEND DATA");
		
		io.emit('msg', data);
		//return data;
	    });
	});
	reqGet.end();
	reqGet.on('error', function(e) {
	    console.error(e);
	});
}

function debounce(time, cb){
	clearTimeout(timeout);
	timeout = setTimeout(function(){
		cb();
	}, time);
}

process.on('SIGINT', function(){
	console.log('Bye bye...');
	ir.unexport();
	process.exit();
});

console.log('initialized...');
