
/*
port.onMessage.addListener(function(msg) {
  if (msg.question == "Who's there?")
    port.postMessage({answer: "Madame"});
  else if (msg.question == "Madame who?")
    port.postMessage({answer: "Madame... Bovary"});
});
*/
var mPort;
document.addEventListener('DOMContentLoaded', function() {

  /*chrome.runtime.onConnect.addListener(function(port){
    alert("connected to tab");
	  mPort = port;

	 });*/

  var mPort = chrome.runtime.connect();

  mPort.onMessage.addListener(function(msg) {

   document.getElementById('catInput').value = msg.category;
   document.getElementById('webInput').value = msg.website;
   document.getElementById('catInput').focus();
  });


	// Add listeners
	document.getElementById('prevBtn').addEventListener('click', function(){
		mPort.postMessage({action:"prevClick", category:document.getElementById('catInput').value});
	}, false);
	document.getElementById('nextBtn').addEventListener('click', function(){
		mPort.postMessage({action:"nextClick", category:document.getElementById('catInput').value});
	}, false);
	document.getElementById('clearTabs').addEventListener('click', function(){
		mPort.postMessage({action:"clearTabs", category:document.getElementById('catInput').value});
	}, false);
	document.getElementById('delBtn').addEventListener('click', function(){
		mPort.postMessage({action:"deleteTab"});
	}, false);
	document.getElementById('catInput').addEventListener('blur', function(){
		mPort.postMessage({action:"updateStorage", category:document.getElementById('catInput').value});
	}, false);
	//document.getElementById('category').addEventListener('blur', whenUnload, false);

});




/*
document.addEventListener('load', function() {
	alert("content loaded");
	iframe.getElementsByName('aBtn').addEventListener('click',aFunc, false);
	window.getElementById('mBtn').addEventListener('click', function(){
		alert("hey");
	});
	document.getElementById('website').value = "hey there";
	document.getElementById('mBtn').addEventListener('click',aFunc, false);
}, false);
*/
function aFunc(){
	alert("hey");
}