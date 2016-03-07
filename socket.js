var http = require('http');

var app = http.createServer(function(req, res) {
        console.log('createServer');
});
app.listen(3000);

var io = require('socket.io').listen(app);

io.on('connection', function(socket) {
    io.emit('msg', 'message');
});

