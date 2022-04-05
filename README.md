# tinkercad-net-connector
A Tinkercad.com Google Chrome Extension that connects Arduino Serial Input/Output to HTTP requests.<br/>

# Important notes
This is heavily untested and may contain bugs - have a look through the source to understand what the code is doing.<br/>
The extension should only be enabled when you are using it, and otherwise it should be turned off - since the current implementation will continue to execute a web request to the server you specify after the refresh rate period elapses (you also have to specify the refresh rate).<br/>

# Pre-installation
Download the source. Open the manifest.json file and update the last permission from `"http://localhost:8080/*"` to the url to the server you will be connecting to.

# Installation
Load the extension source in chrome. To load the extension in chrome do the following:
1. In chrome browse to the url `chrome://extensions/`
2. Click on `Load unpacked` and select the source folder.
That's it, it should be loaded.

# Configuration
It's best to interact with the extension from a chrome tab that has a tinkercad.com circuit loaded. The url should follow the following format: https://tinkercad.com/things/YOUR_CIRCUIT_UNIQUE_ID<br/>
Then follow these steps:<br/>
1. Find the 'Tinkercad Net Connector' extension in chrome (typically in top right of the window there's a puzzle piece icon that represents extensions - click it).<br/>
2. Click on the 'T' icon which belongs to the 'Tinkercad Net Connector' extension.<br/>
3. In the popup window you will be required to enter two fields:<br/>
  a. The 'Base url' to where serial output from tinkercad.com will be sent to. This same 'Base url' will be used to check for any incoming data as well. If you are testing with a local server then this base url might be something like: http://127.0.0.1:8080/arduinoserver<br/>
  b. The 'Input Refresh Rate' in milliseconds, which is used by the chrome extension to periodically check the server (specified in a. above) to see if there is any pending input that should be sent to the tinkercad.com arduino.<br/>
4. The 'Broadcast Raw to All' checkbox indicates whether data intended for Tinkedcad devices are broadcast to all in a raw format, or whether they are directed to a specific device in which case it expects incoming data to be in a specific format (described below).

# Server Code Web API
The server 'Base url' will be the single URL that the extension will communicate with. It makes use of query string parameters to both send arduino output to and to check for arduino input from. The two commands that can be used follow:<br/>
1. The 'output' command - Arduino output will be sent to the 'Base url' with:<br/>
* The following query string parameters<br/>
  a. `msg` which will contain the value `output`.<br/>
  b. `out` which will contain the text output to the serial output. The extension will listen for output and will send output after it detects a '\n' character. The current implementation requires that you do not clear the 'serial output' in tinkercad.com.<br/>
  c. `device` is used to emulate different devices, which makes use of the associated chrome tab's ID to represent a device ID.<br/>
* and any response text that the server replies back with will be sent to the arduino.<br/>
An example GET request for this command follows: `http://127.0.0.1:8080/arduinoserver?msg=output&out=testing&device=203`

2. The 'allinputs' command - All inputs for any arduinos in any tinkercad.com tab should be able to be retrieved using this command. The only query string parameter is `msg` and it must contain the value `allinputs`.<br/>
The GET request for this command will always take the form: `http://127.0.0.1:8080/arduinoserver?msg=allinputs`<br/>
There are two ways to respond, based upon the 'Broadcast Raw to All' checkbox:
  a. If the 'Broadcast Raw to All' option is checked, then any data sent in the response will be forwarded to all Tinkercad devices.<br/>
  b. If the 'Broadcast Raw to All' option is not checked then, the response must contain a JSON object, which contains any number of input values for a specified device/tab, in the following format:<br/>
```javascript
{
  "inputs": [
    {"device": 203, "value": 777},
    {"device": 421, "value": 123},
  ]
}
```
This example response contains two input values intended for two different tinkercad.com devices/tabs. The value '777' will be sent to device/tab ID '203', and '123' sent to device/tab ID '421'. Your server can learn about which devices it can communicate with by first sending a message from the device to the server using the 'output' command (since the extension will include in the GET request the device ID as a query string parameter as described above).<br/>
<br/>
<br/>
