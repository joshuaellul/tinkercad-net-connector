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
    let response = await new Promise(resolve =>
        fetch(url).then(r => r.text()).then(r => {
            resolve(r);
        })
    );            
    return response;
}

async function handleSendOutput(request, sender, sendResponse) {
    let url = await getUrlBase();
    if (url == null || url.length == 0) return;                
    url += "?msg=output";
    url += "&out=" + encodeURIComponent(request.output);
    url += "&device=" + encodeURIComponent(sender.tab.id);
    response = await fetchAndGetResponse(url);
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
                chrome.tabs.sendMessage(input.device, {msg: "process-input", input: input.value});
            });
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
