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
    } else if (req.query.msg === 'allinputs') {
        var inputsArray = [];
        devices.forEach(element => {
            inputsArray.push({
                "device": element,
                "value": (Math.floor(Math.random() * 999) + 1).toString() + "+"
            });
        });
        var ret = {
            "inputs": inputsArray
        };
        res.send(JSON.stringify(ret));
    }        
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});