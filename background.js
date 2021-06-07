var refreshRateTimer = null;

async function setTimer(seconds) {

    refreshRateInMS = seconds * 1000;

    if (refreshRateTimer != null) {
        clearInterval(refreshRateTimer);        
    }
    
    refreshRateTimer = setInterval(refreshRateTimerExecute, refreshRateInMS);
}

async function handleSetTimerRefreshRate(request, sender, sendResponse) {
    setTimer(request.seconds);            
    return true;
}

async function handleSendOutput(request, sender, sendResponse) {
    chrome.storage.local.get(['urlbase'], function(result) {                
        var url = result.urlbase;
        if (url == null || url.length == 0) return;                
            url += "?msg=output";
            url += "&out=" + encodeURIComponent(request.output);
            url += "&device=" + encodeURIComponent(sender.tab.id);
            fetch(url).then(r => r.text()).then(r => {
                sendResponse(r);
            });
            return true;
    });  
}

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        if (request.msg == "send-output") {
            return handleSendOutput(request, sender, sendResponse);
        } else if (request.msg == "get-tabid") {
            sendResponse(sender.tab.id);
            return true;
        } else if (request.msg == "set-refreshrate") {
            return handleSetTimerRefreshRate(request, sender, sendResponse);
        }             
    }
);

function refreshRateTimerExecute() {
    var url = "";
    chrome.storage.local.get(['urlbase'], function(result) {                
        url = result.urlbase;
        if (url == null || url.length == 0) return;                
            url += "?msg=allinputs";            
            fetch(url).then(r => r.text()).then(response => {            
                //send response to the correct tab
                const obj = JSON.parse(response);
                obj.inputs.forEach(input => {
                    chrome.tabs.sendMessage(input.device, {msg: "process-input", input: input.value}, function(response) {
                        //ignore response
                    });
                });
            });
            return true;
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
