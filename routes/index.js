exports.index = function (req, res) {
    res.render('index', {server: global.server, waitingList: global.waitingList, last: global.last, count: global.count, timeOut: global.timeOut, running: global.running});
};

exports.stat = function (req, res) {
    res.send(true);
};

exports.add = function (req, res) {
    global.waitingList.push(req.body);
    if(!global.running){
        global.running = true;
        global.lbcscraper.run();
    }
    res.send(true);
};

exports.start = function (req, res) {
    if(!global.running){
        global.running = true;
        global.lbcscraper.run();
    }
    res.send(true);
};

exports.stop = function (req, res) {
    if(global.running){
        global.waitingList = [];
        global.running = false;   
    }
    res.send(true);
};

exports.updateServer = function (req, res) {
    if(req.body.server){
        global.server = req.body.server;
    }
    res.send(true);
};
