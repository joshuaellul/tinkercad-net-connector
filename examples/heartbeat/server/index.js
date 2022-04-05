const express = require('express');
const app = express();
const port = 8080;

var devices = new Array();

app.get('/arduinoserver', (req, res) => {
    if (req.query.msg === 'output') {
        var deviceid = parseInt(req.query.device);        
        if (!devices.includes(deviceid)) {
            devices.push(deviceid);
        }   
        res.set('Access-Control-Allow-Origin', '*');
        res.send(200);
    } else if (req.query.msg === 'allinputs') {
        res.set('Access-Control-Allow-Origin', '*');
        res.send("+");
    }        
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});