//alert("hello");
//document.body.style.background = 'yellow';
var height = '40px';
var iframe = document.createElement('iframe');
iframe.src = chrome.extension.getURL('toolbar.html');
iframe.style.height = height;
iframe.style.width = '100%';
iframe.style.position = 'fixed';
iframe.style.top = '0';
iframe.style.left = '0';
iframe.style.zIndex = '938089'; // Some high value
// Etc. Add your own styles if you want to

document.documentElement.appendChild(iframe);
var bodyStyle = document.body.style;
var cssTransform = 'transform' in bodyStyle ? 'transform' : 'webkitTransform';
bodyStyle[cssTransform] = 'translateY(' + height + ')';

//var mScript = document.createElement('script');
/*

iframe.addEventListener('load', function() {
	alert("content loaded");
	iframe.getElementsByName('aBtn').addEventListener('click',aFunc, false);
	window.getElementById('mBtn').addEventListener('click', function(){
		alert("hey");
	});
	document.getElementById('website').value = "hey there";
	document.getElementById('mBtn').addEventListener('click',aFunc, false);
}, false);

function aFunc(){
	alert("hey");
}*/