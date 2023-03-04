var refreshRateTimer = null;
var doRawToAll = true;
var running = false;

const readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], function (result) {
        if (result[key] === undefined) {
          resolve('');
        } else {
          resolve(result[key]);
        }
      });
    });
  };

async function checkAndGetRunning() {
    running = await readLocalStorage('running');
    return running;
}

async function setTimer(refreshRateInMS) {

    if (refreshRateTimer != null) {
        clearInterval(refreshRateTimer);        
    }

    chrome.storage.local.get(['rawtoall'], function(result) {                
        doRawToAll = result.rawtoall;
    });  
    
    await checkAndGetRunning();

    if (running) {
        refreshRateTimer = setInterval(refreshRateTimerExecute, refreshRateInMS);
        chrome.browserAction.setIcon({path: 'on.png'});
    }    
}

async function handleSetTimerRefreshRate(request, sender, sendResponse) {
    await checkAndGetRunning();
    if (running) {
        setTimer(request.ms);
    }
}

async function getUrlBase() {
    let urlbase = await new Promise(resolve =>
        chrome.storage.local.get(['urlbase'], (result) => {  
            resolve(result.urlbase);
        })
    );
    return urlbase;
}

async function fetchAndGetResponse(url) {
    try {
        let response = await new Promise(resolve =>
            fetch(url).then(r => r.text()).then(r => {
                resolve(r);
            })
        );   
        return response;
    } catch (err) {
        console.log(err);
    }        
    return null;
}

async function handleSendOutput(request, sender, sendResponse) {
    
    await checkAndGetRunning();
    if (!running) {
        return;
    }
    
    let url = await getUrlBase();
    if (url == null || url.length == 0) return;                
    url += "?msg=output";
    url += "&out=" + encodeURIComponent(request.output);
    url += "&device=" + encodeURIComponent(sender.tab.id);
    let response = await fetchAndGetResponse(url);
    sendResponse(response);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg == "send-output") {            
            handleSendOutput(request, sender, sendResponse);
            return true;
        } else if (request.msg == "get-tabid") {
            sendResponse(sender.tab.id);            
            return true;
        } else if (request.msg == "set-refreshrate") {
            handleSetTimerRefreshRate(request, sender, sendResponse);
            return true;
        }             
    }    
);

async function refreshRateTimerExecute() {    
    await checkAndGetRunning();
    if (!running) {
        if (refreshRateTimer != null) {
            clearInterval(refreshRateTimer);        
        }
        chrome.browserAction.setIcon({path: 'off.png'});
        return;
    }

    var url = "";    
    chrome.storage.local.get(['urlbase'], function(result) {                
        url = result.urlbase;
        if (url == null || url.length == 0) return;                
        url += "?msg=allinputs";            
        fetch(url).then(r => r.text()).then(response => {
            if (!doRawToAll) {
                //send response to the correct tab
                const obj = JSON.parse(response);
                obj.inputs.forEach(input => {  
                    var deviceId = parseInt(input.device);
                    try {
                        chrome.tabs.sendMessage(deviceId, {msg: "process-input", input: input.value});
                    } catch (err) { 
                        console.log(err);
                    }
                });
            } else {
                chrome.tabs.query({}, function(tabs) {
                    for (var i=0; i<tabs.length; ++i) {
                        chrome.tabs.sendMessage(tabs[i].id, {msg: "process-input", input: response});
                    }
                });
            }      
        });
    }); 
};

async function initialiseAlarm() {
    chrome.storage.local.get(['refreshrate'], function(result) {                
        var refreshrate = Number(result.refreshrate);
        if (Number.isInteger(refreshrate)) {
            setTimer(refreshrate);
        }        
    });  
}

initialiseAlarm();
