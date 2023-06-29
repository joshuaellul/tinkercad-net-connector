var monitoringTabs = {}; 
var theDiv = null;
var lastText = "";

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

async function getTabId() {
    let tabid = await new Promise(resolve =>
        chrome.runtime.sendMessage({msg: "get-tabid" }, (response) => {
            resolve(response);
        })
    );
    return tabid;
}

var documentObserver = new MutationObserver(async function(mutations, observer) {        
    let tabid = await getTabId();

    //check if an event handler has already been set up for the particular tab
    if (monitoringTabs[tabid] == true) {
        return;
    }

    monitoringTabs[tabid] = true;

    elements = document.querySelectorAll("[class*=code_panel__serial__text]");
    if (elements != null && elements.length > 0) {        
        theDiv = elements[0];
        theDiv.addEventListener('DOMSubtreeModified', function(ev) {            
            var urlbase = "";
            chrome.storage.local.get(['urlbase'], function(result) {                
                urlbase = result.urlbase;

                if (urlbase == null || urlbase.length == 0) {
                    return;
                }

                var latestPos = lastText.length;
                var latestDiff = theDiv.innerHTML.substring(latestPos + lastText.length);
                
                if (latestDiff.includes('\n')) {                    
                    const line = latestDiff.substring(0, latestDiff.indexOf('\n') + 1);                    
                    lastText = theDiv.innerHTML.substring(0, latestPos + line.length);
                    chrome.runtime.sendMessage({msg: "send-output", output: line}, response => {
                        if (response != null) {
                            sendInputToDevice(response);
                        }
                    });              
                }            
            });                                                
        }, false);        
    }
});

async function sendInputToDevice(input) {
    elements = document.querySelectorAll("[class*=code_panel__serial__input]");
    if (elements != null && elements.length > 0) {
        theInputField = elements[0];
        theInputField.value = input;
        elements = document.querySelectorAll("[class*=js-code_panel__serial__send]");
        if (elements != null && elements.length > 0) {
            theSendButton = elements[0];
            theSendButton.click();
        }
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {      
        if (request.msg == "process-input") {
            sendInputToDevice(request.input);
        }        
    }
);

documentObserver.observe(document, {
  subtree: true,
  attributes: true
});

