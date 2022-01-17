let button = document.getElementById('btnSet');
let baseurl = document.getElementById('baseurl');
let inputRefreshRate = document.getElementById('inputRefreshRate');

chrome.storage.local.get(['urlbase'], function(result) {                
    if (result.urlbase == null) result.urlbase = "";
    baseurl.value = result.urlbase;
});
chrome.storage.local.get(['refreshrate'], function(result) {
    if (result.refreshrate == null) result.refreshrate = "";
    inputRefreshRate.value = result.refreshrate;
});

button.addEventListener('click', setBaseURL);

function setBaseURL() {
    chrome.storage.local.set({urlbase: baseurl.value}, function() {        
    });
    chrome.storage.local.set({refreshrate: inputRefreshRate.value}, function() {        
    });
    chrome.runtime.sendMessage({msg: "set-refreshrate", seconds: inputRefreshRate.value});                    
}