const express = require('express');
const app = express();
const port = 8080;

var devices = new Array();
var messageBuffer = new Array();

app.get('/arduinoserver', (req, res) => {
    if (req.query.msg === 'output') {
        //var deviceid = parseInt(req.query.device);        
        //if (!devices.includes(deviceid)) {
            //devices.push(deviceid);
        //}   
        messageBuffer.push(req.query.out);
        res.set('Access-Control-Allow-Origin', '*');
        res.send(200);
    } else if (req.query.msg === 'allinputs') {
        res.set('Access-Control-Allow-Origin', '*');
        if (messageBuffer.length > 0) {
            var ret = messageBuffer.pop();
            ret = ret.substring(0, ret.length - 2);
            var len = (ret.length & 0x000000ff);
            var toSend = String.fromCharCode(2) + String.fromCharCode(len) + ret + String.fromCharCode(3);            
            res.send(toSend);
        } else {
            res.send(200);
        }        
    }        
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});