const express = require('express');
const app = express();
const port = 8080;

var devices = new Array();

app.get('/arduinoserver', (req, res) => {
    if (req.query.msg === 'output') {
    } else if (req.query.msg === 'allinputs') {
        var ret = (Math.floor(Math.random() * 999) + 1).toString();
        res.set('Access-Control-Allow-Origin', '*');
        res.send(ret);
    }        
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});