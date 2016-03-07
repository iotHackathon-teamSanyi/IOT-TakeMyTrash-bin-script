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
	io.emit('msg', counter);
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
				io.emit('msg', counter);
				console.log("SEND DATA");
			});
			lastTime = currentTime;
		}
	}
});

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
