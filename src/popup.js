let button = document.getElementById('btnSet');
let baseurl = document.getElementById('baseurl');
let inputRefreshRate = document.getElementById('inputRefreshRate');
let checkRawToAll = document.getElementById('checkRawToAll');
let checkRunning = document.getElementById('checkRunning');

chrome.storage.local.get(['urlbase'], function(result) {                
    if (result.urlbase == null) result.urlbase = "";
    baseurl.value = result.urlbase;
});
chrome.storage.local.get(['refreshrate'], function(result) {
    if (result.refreshrate == null) result.refreshrate = "";
    inputRefreshRate.value = result.refreshrate;
});
chrome.storage.local.get(['rawtoall'], function(result) {
    if (result.rawtoall == null) result.rawtoall = true;
    checkRawToAll.checked = result.rawtoall;
});
chrome.storage.local.get(['running'], function(result) {
    if (result.running == null) result.running = true;
    checkRunning.checked = result.running;
});

button.addEventListener('click', saveSettings);

function saveSettings() {
    chrome.storage.local.set({urlbase: baseurl.value}, function() {        
    });
    chrome.storage.local.set({refreshrate: inputRefreshRate.value}, function() {        
    });
    chrome.storage.local.set({rawtoall: checkRawToAll.checked}, function() {        
    });
    chrome.storage.local.set({running: checkRunning.checked}, function() {        
    });
    chrome.runtime.sendMessage({msg: "set-refreshrate", ms: inputRefreshRate.value});                    
}