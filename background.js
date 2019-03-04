/*chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

    var port = chrome.tabs.connect(tabs[0].id);
    alert("connecting to tab");
    port.onMessage.addListener(function(msg) {
      alert("message recieved");
		switch(msg.action) {
			case "prevClick":
			  alert("prevClick request");
				prevClick();
				break;
			case "nextClick":
				nextClick();
				break;
			case "fileChanged":
				readSingleFile();
				break;
			case "showCsv":
				showCsv();
				break;
			case "clearTabs":
				clearAllTabs();
				break;
			case "deleteTab":
				deleteThis();
				break;
			case "loadPages":
				loadPagesFrom();
				break;

		}
	});
});*/


var curIndex;
var contents;
var contSplit;
var notViewed;
var loadedNotViewed;





chrome.runtime.onConnect.addListener(function(port) {


  //chrome.tabs.onActivated.addListener(function(curTab){
    //setCurIndex(curTab.id);
    //loader(curIndex);

  //});

	//alert("connected");
	//console.assert(port.name == "greetings from toolbar");

  // Add listeners
  port.onMessage.addListener(function(msg) {

    chrome.storage.local.get(function(allItems){

  	  // Get storage
  		contSplit = allItems['contSplit'];

  		// Fill inputs
  		activeId = port.sender.tab.id;
      setCurIndex(activeId);
  	  if(curIndex<0){curIndex=0}
  	  if(curIndex>=contSplit.length){curIndex = contSplit.length-1}

  		// Check fields
  		//checkTabsExist();// Worth having in terms of performance?
  		//addHttps();
      switch(msg.action) {
			case "prevClick":
				prevClick(msg.category, port.sender.tab.id);
				break;
			case "nextClick":
				nextClick(msg.category, port.sender.tab.id);
				break;
			case "fileChanged":
				readSingleFile(msg.event);
				break;
			case "showCsv":
				showCsv(msg.category, port.sender.tab.id);
				break;
			case "clearTabs":
				clearAllTabs(msg.category);
				break;
			case "deleteTab":
				deleteThis();
				break;
			case "loadPages":
				loadPagesFrom();
				break;
			case "refresh":
			  refreshSite(port.sender.tab.url);
			  break;
			case "updateStorage":
			 storeDetails(msg.category, port.sender.tab.id);
	     chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex});
	     break;

		}
		/*
		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      for(i=0;i<contSplit.length;i++){
    		if(contSplit[i][2] == tabId){
      	  chrome.tabs.executeScript(tabId, {file: "content.js"});
      	}
    	}


    };)*/



  	});



	});


chrome.storage.local.get(function(allItems){

  	  // Get storage
  		contSplit = allItems['contSplit'];

  		// Fill inputs
  		activeId = port.sender.tab.id;
      setCurIndex(activeId);
  	  if(curIndex<0){curIndex=0}
  	  if(curIndex>=contSplit.length){curIndex = contSplit.length-1}
      port.postMessage({website:contSplit[curIndex][0], category:contSplit[curIndex][1]})

  		// Check fields
  		//checkTabsExist();// Worth having in terms of performance?
  		//addHttps();

  	});








});


function setCurIndex(tabId){
  for(i=0; i<contSplit.length; i++){
    if(contSplit[i][2] == tabId){
      curIndex = i;
    }
  }
}


//chrome.tabs.onActivated(function(curTab){

  //loader(curIndex);
  /*
  chrome.tabs.query({active:true, currentWindow:true}, function(curTab){
			//alert(activeId);
			for(i=0;i<contSplit.length;i++){
				if(contSplit[i][2] == curTab[0].id){
					curIndex = i;
					contSplit[i][3] = true;
					fillBoxes(contSplit[curIndex][0], contSplit[curIndex][1]);
					loader(curIndex);
					updateStorage();
				}
			}

			toggleBtn(curTab.url);

		});*/

//});


/*
document.addEventListener('DOMContentLoaded', function() {

	document.onkeydown = keyPress;
	chrome.storage.local.get(function(allItems){
		contSplit = allItems['contSplit'];
		curIndex = allItems['curIndex'];
		removeTabs = allItems['removeTabs'];
		if(curIndex<0){curIndex=0}
		if(curIndex>=contSplit.length){curIndex = contSplit.length-1}
		checkTabsExist();
		addHttps();

		chrome.tabs.query({active:true, currentWindow:true}, function(curTab){
			activeUrl = curTab[0].url;
			activeId = curTab[0].id;
			for(i=0;i<contSplit.length;i++){
				if(contSplit[i][2] == curTab[0].id){
					curIndex = i;
					contSplit[i][3] = true;
					fillBoxes(contSplit[curIndex][0], contSplit[curIndex][1]);
					loader(curIndex);
					updateStorage();
				}
			}

			toggleBtn();

		});
	});
	document.getElementById('category').focus();


});
*/
function myFunction() {
    var x = document.getElementById("category");
    x.value = x.value.toUpperCase();
}


function keyPress(event){
	if(event.keyCode == 40){
		nextClick();
	}
	if(event.keyCode == 38){
		prevClick();
	}
}

function addHttps(){
	for(i=0;i<contSplit.length;i++){
		if(contSplit[i][0].indexOf("http")==-1){
			contSplit[i][0] = "http://" + contSplit[i][0];
		}
	}
}

function loadPagesFrom(){
	loadFrom = curIndex;
	if(loadFrom != null && loadFrom>-1 && loadFrom<contSplit.length){
		for(i=0;i<contSplit.length;i++){
			if(i>curIndex-2 && i<curIndex+5){
				if(contSplit[i][2]==0 && i!=curIndex){
					loadPage(contSplit[i][0], i, false,0);
				}
			}else{
				if(contSplit[i][2]>0){
					removeTab(i);
				}
			}
		}
		if(contSplit[curIndex][2]==0){
			chrome.tabs.create({index:4,url: contSplit[curIndex][0], active:false}, function(createdTab){
				contSplit[curIndex][2] = createdTab.id;
				chrome.tabs.executeScript(createdTab.id, {file: "content.js"});
				chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex}, function(){
					updateActive(curIndex);
				});
			});
		}else{
			chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex}, function(){
				updateActive(curIndex);
			});
		}
	}
}

/*
function loadPagesFrom(){
	loadFrom = prompt("Starting at index:");
	if(loadFrom != null){
		curIndex = loadFrom;
		for(i=curIndex-1;i<curIndex+5;i++){
			if(i!=curIndex && i>-1 && i<contSplit.length && contSplit[i][2]==0){
				loadPage(contSplit[i][0], i, false,0);
			}
		}
		if(contSplit[curIndex][2]==0){
			chrome.tabs.create({index:4,url:  +contSplit[curIndex][0], active:false}, function(createdTab){
				contSplit[curIndex][2] = createdTab.id;
				chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex}, function(){
					updateActive(curIndex);
				});
			});
		}else{
			chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex}, function(){
				updateActive(curIndex);
			});
		}
	}
}
*/

function clearAllTabs(catValue){
  if(activeId == contSplit[curIndex][2]){
		contSplit[curIndex][1] = catValue;
	}
	chrome.storage.local.set({'contSplit':contSplit,'curIndex':curIndex}, function(){
	  for(i=0;i<contSplit.length;i++){
  		if(contSplit[i][2]!=0)
  			removeTab(i);
  	}
	});

}

function checkTabsExist(){
	var allTabIds = [];
	chrome.tabs.query({currentWindow:true}, function(allTabs){
		for(i=0;i<allTabs.length;i++){
			allTabIds.push(allTabs[i].id);
		}
		for(i=0;i<contSplit.length;i++){
			if(allTabIds.indexOf(contSplit[i][2])==-1){
				contSplit[i][2] = 0;
			}
		}
	});

}

function toggleBtn(activeUrl){
	var editSite = document.getElementById('refBtn');
	var delBtn = document.getElementById('delBtn');
	var webAdd = document.getElementById('website').value;
	if(webAdd != ""){
		delBtn.style.visibility = 'visible';
		editSite.value = 'Refresh';
		editSite.addEventListener('click', function(){
		  refreshSite(activeUrl);
		}, false);
	}else{
		delBtn.style.visibility = 'hidden';
		editSite.value = "Add";
		editSite.addEventListener('click', function(){
		  addSite(port.sender.tab.id, port.sender.tab.url);
		}, false);
	}
}

function refreshSite(activeUrl){
	contSplit[curIndex][0] = activeUrl;
	chrome.storage.local.set({'contSplit':contSplit}, function(){
		fillBoxes(contSplit[curIndex][0], contSplit[curIndex][1]);
	});

}



function updateStorage(){
    chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex});
}


function readSingleFile(e) {
  //alert("read single file")
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
	//notViewed = [];
	//loadedNotViewed = [];
	removeTabs = [];
	curIndex = 0;
  contents = e.target.result;
	contSplit = contents.split("\n");
	removeEmpty();
	for(i=0;i<contSplit.length;i++){
		contSplit[i] = contSplit[i].replace("\r","");
		contSplit[i] = contSplit[i].split(",");
		contSplit[i][2] = 0;
		contSplit[i][3] = false;
	}

	addHttps();
	for(i=1;i<5;i++){
		loadPage(contSplit[i][0], i, false,0);
	}
	chrome.tabs.create({index:4,url: contSplit[0][0], active:false}, function(createdTab){
	  chrome.tabs.executeScript(createdTab.id, {file: "content.js"});
		contSplit[0][2] = createdTab.id;
		chrome.storage.local.set({'contSplit':contSplit, 'curIndex':0}, function(){
			updateActive(0);
		});
	});
  };
  reader.readAsText(file);
}

function goToSite(){
	storeDetails();
	chrome.storage.local.set({'contSplit':contSplit}, function(){
		goToThis = prompt("Enter a web address:");
		if(goToThis.indexOf("http")==-1){
			goToThis = "http://" + goToThis;
		}
		if(goToThis != null){
			chrome.tabs.create({url: goToThis, active:true});
		}
	});

}

function addSite(newId, newUrl){
	curIndex++;
	var siteCat = document.getElementById('category').value;
	contSplit.splice(curIndex, 0, [newUrl,siteCat,newId,true]);
	chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex}, function(){
		fillBoxes(contSplit[curIndex][0], contSplit[curIndex][1]);
		loader(curIndex);
		document.getElementById('delBtn').style.visibility = 'visible';
		var editSite = document.getElementById('refBtn');
		editSite.value = "Refresh";
		editSite.addEventListener('click', function(){
		  refreshSite(newUrl);
		}, false);
	});


}


function deleteThis(){
	if(confirm("Are you sure you want to delete?")){
		remId = contSplit[curIndex][2];
		contSplit.splice(curIndex, 1);
		loader(curIndex);
		chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex}, function(){
			chrome.tabs.remove(remId);
			updateActive(curIndex);
		});

	}
}

function siteNameEdit(){
	var siteCat = document.getElementById('category').value;
	var oldName = document.getElementById('website').value;
	var newName = prompt("Edit web address:", oldName);
	if(newName.indexOf("http")==-1){
		newName = "http://" + newName;
	}
	if(newName != null){
		contSplit[curIndex][0] = newName;
		chrome.tabs.update({url: newName}, function(crtdTab){
			contSplit[curIndex][2] = crtdTab.id;
			contSplit[curIndex][1] = siteCat;
			chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex});
			fillBoxes(newName, siteCat);
		});
	}
}

function showCsv(catValue, activeId){
	storeDetails(catValue, activeId);
	var rtrnStrg = "";
	for(i=0;i<contSplit.length;i++){
		rtrnStrg = rtrnStrg + contSplit[i].slice(0,2).join() + "\n";
	}
	//element.innerHTML = rtrnStrg;
	//element.show();
	prompt("Csv String:",rtrnStrg);
}

function removeEmpty(){
	var deleteIt = [];
	for(i=0;i<contSplit.length;i++){
		if(contSplit[i].indexOf(".")<0){
			deleteIt.push(i);
		}
	}
	deleteIt.reverse();
	for(i=0;i<deleteIt.length;i++){
		contSplit.splice(deleteIt[i],1);
	}
}

function loadPage(pageUrl, listIndex, isActive, loadIndex){
	if(pageUrl.length>4){
		chrome.tabs.create({index:loadIndex,url: pageUrl, active:isActive}, function(createdTab){
		  chrome.tabs.executeScript(createdTab.id, {file: "content.js"});
			contSplit[listIndex][2] = createdTab.id;
			updateStorage();
		});
	}
}

function removeTab(listIndex){
	chrome.tabs.remove(contSplit[listIndex][2], function(){
		//if(!contSplit[listIndex][3]){
		//	notViewed.push(listIndex);
		//}
		contSplit[listIndex][2] = 0;
		chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex});
	});
}


function fillBoxes(webAdd, siteCat){
	document.getElementById('website').value = webAdd;
	document.getElementById('category').value = siteCat;
}

function storeDetails(catValue, activeId){
	if(activeId == contSplit[curIndex][2]){
		contSplit[curIndex][1] = catValue;
	}
}

function whenUnload(){
	storeDetails();
	chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex});
}

function loader(mIndex){
	for(i=0;i<contSplit.length;i++){
		if(i>mIndex-2 && i<mIndex+5){
			if(i<contSplit.length){
				if(i>-1 && contSplit[i][2]==0){
					loadPage(contSplit[i][0], i, false, 0);
				}
			}
		} else {
			if(contSplit[i][2]>0){
				removeTab(i);
			}
		}
	}
	//if(tabsLoaded<6 && !mIndex == 0 && notViewed.length > 0){
		//nv_idx = notViewed.shift();
		//loadedNotViewed.push(nv_idx);
		//loadPage("http://"+contSplit[nv_idx][0], nv_idx, false, 0);
	//}
}

function updateActive(mIndex){

	var allTabIds = [];
	chrome.tabs.query({currentWindow:true}, function(allTabs){
		for(i=0;i<allTabs.length;i++){
			allTabIds.push(allTabs[i].id);
		}
		for(i=0;i<contSplit.length;i++){
			if(allTabIds.indexOf(contSplit[i][2])==-1){
				contSplit[i][2] = 0;
			}
		}
		var tab_id = contSplit[mIndex][2];
		if(tab_id>0){
  		chrome.tabs.update(tab_id, {active:true});
  	} else {
  		chrome.tabs.create({index:4,url: contSplit[mIndex][0], active:false}, function(createdTab){
  		  chrome.tabs.executeScript(createdTab.id, {file: "content.js"});
  			contSplit[mIndex][2] = createdTab.id;
  			chrome.storage.local.set({'contSplit':contSplit, 'curIndex':mIndex}, function(){
  				chrome.tabs.update(createdTab.id, {active:true});
  			});
  		});
  	}
	});

}


function nextClick(catValue, activeId){
  //alert("next click");
	if(curIndex < contSplit.length-1){
	  //alert("first if passed");
		storeDetails(catValue, activeId);
		//alert("storeDetails done");
		if(curIndex>0){
			removeTab(curIndex-1);
		}
		//alert("removeTabs done");
		curIndex++;
		loader(curIndex);
		//alert("loader done");
		//if (curIndex+4<contSplit.length){
		//	loadPage("http://"+contSplit[curIndex+4][0], curIndex+4, false,0);
		//}
		chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex}, function(){
			updateActive(curIndex);
		});
	}else{
		storeDetails(catValue, activeId);
		updateStorage();
		window.alert("You've reached the end");
	}
		//if(loadedNotViewed.length>0){
			//siteCat = document.getElementById('category').value;
			//contSplit[curIndex][1] = siteCat;
			//nv_idx = loadedNotViewed.shift();
			//updateStorage();
			//updateActive(nv_idx);
		//}
	//}
}

function prevClick(catValue, activeId){
  //alert("prev click" + curIndex)
	if (curIndex > 0){
		storeDetails(catValue, activeId);
		if (curIndex+4<contSplit.length){
			removeTab(curIndex+4);
		}
	    curIndex--;
		loader(curIndex);
		//if(curIndex>1){
		//	loadPage("http://"+contSplit[curIndex-1][0], curIndex-1, false, 6);
		//}
		chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex}, function(){
			updateActive(curIndex);
		});
	}else{
		storeDetails(catValue, activeId);
		updateStorage();
		window.alert("You've reached the start");
	}


}

