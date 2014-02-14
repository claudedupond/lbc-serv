exports.index = function (req, res) {
    res.render('index', {server: global.server, waitingList: global.waitingList, last: global.last, count: global.count, timeOut: global.timeOut, running: global.running});
};

exports.stat = function (req, res) {
    res.send(true);
};

exports.add = function (req, res) {
    if(global.running){
        global.waitingList.push(req.body);
        res.send(true);
    }
    else
        res.send(false);
};

exports.start = function (req, res) {
    global.waitingList = [];
    global.running = true;
    res.send(true);
};

exports.stop = function (req, res) {
    global.waitingList = [];
    global.running = false;
    res.send(true);
};

exports.updateServer = function (req, res) {
    global.server = req.body.url;
    res.send(true);
};