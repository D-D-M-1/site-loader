var contSplit;
var contents;
var curIndex;
var activeId;


document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('file-input').addEventListener('change', readSingleFile, false);
  document.getElementById('clearTabs').addEventListener('click', clearAllTabs, false);
  document.getElementById('loadPages').addEventListener('click', loadPagesFrom, false);
  document.getElementById('getCsv').addEventListener('click', showCsv, false);

	chrome.storage.local.get(function(allData){
	  contSplit = allData['contSplit'];
	  curIndex = allData['curIndex'];
	  try
	  {toggleBtn();}
	  catch(err)
	  {}
	});
}, false);


function toggleBtn(){
	var editSite = document.getElementById('addSite');
	chrome.tabs.query({active:true, currentWindow:true}, function(curTab){
	  activeId = curTab[0].id;
	  for(i=0; i<contSplit.length; i++){
	    if(contSplit[i][2] == curTab[0].id){
	      editSite.value = 'Refresh';
		    editSite.addEventListener('click', function(){
		      refreshSite(curTab[0].id, curTab[0].url);
		    }, false);
		    curIndex = i;
	    }
	  }
	  if(editSite.value != 'Refresh'){
	    editSite.addEventListener('click', function(){
	      addSite(curTab[0].id, curTab[0].url);
	    }, false);
	  }
	});

}


function readSingleFile(e) {
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
		contSplit[0][2] = createdTab.id;
		chrome.tabs.executeScript(createdTab.id, {file: "content.js"});
		chrome.storage.local.set({'contSplit':contSplit, 'curIndex':0}, function(){
			updateActive(0);
		});
	});
  };
  reader.readAsText(file);
}

function addHttps(){
	for(i=0;i<contSplit.length;i++){
		if(contSplit[i][0].indexOf("http")==-1){
			contSplit[i][0] = "http://" + contSplit[i][0];
		}
	}
}

function updateActive(mIndex){
	var tab_id = contSplit[mIndex][2];
	if(tab_id>0){
		chrome.tabs.update(tab_id, {active:true});
	} else {
		chrome.tabs.create({index:4,url: contSplit[mIndex][0], active:false}, function(createdTab){
			contSplit[mIndex][2] = createdTab.id;
			chrome.tabs.executeScript(createdTab.id, {file: "content.js"},function(scriptInjected){
			  chrome.storage.local.set({'contSplit':contSplit, 'curIndex':mIndex}, function(){
				  chrome.tabs.update(createdTab.id, {active:true});
			  });
			});

		});
	}
}


function loadPage(pageUrl, listIndex, isActive, loadIndex){
	if(pageUrl.length>4){
		chrome.tabs.create({index:loadIndex,url: pageUrl, active:isActive}, function(createdTab){
			contSplit[listIndex][2] = createdTab.id;
			chrome.tabs.executeScript(createdTab.id, {file: "content.js"});
			updateStorage();
		});
	}
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

function clearAllTabs(){
	 for(i=0;i<contSplit.length;i++){
  	if(contSplit[i][2]!=0)
  		removeTab(i);
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


function addSite(newId, newUrl){
	contSplit.splice(curIndex, 0, [newUrl,"",newId,true]);
	chrome.storage.local.set({'contSplit':contSplit}, function(){
		loader(curIndex);
		chrome.tabs.executeScript(newId, {file: "content.js"}, function(scriptInjected){
		  port.postMessage({website:contSplit[curIndex][0], category:contSplit[curIndex][1]});
		});
	});
}


function refreshSite(activeId, activeUrl){
	contSplit[curIndex][0] = activeUrl;
	chrome.storage.local.set({'contSplit':contSplit}, function(){
		chrome.tabs.executeScript(activeId, {file: "content.js"}, function(scriptInjected){
		  port.postMessage({website:contSplit[curIndex][0], category:contSplit[curIndex][1]});
		});
	});
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
}

function loadPagesFrom(){
	for(i=curIndex-1;i<curIndex+5;i++){
	  if(i != curIndex && i>-1 && i<contSplit.length){
		  loadPage(contSplit[i][0], i, false,0);
	  }
	}
	chrome.tabs.create({index:4,url: contSplit[curIndex][0], active:false}, function(createdTab){
		contSplit[curIndex][2] = createdTab.id;
		chrome.tabs.executeScript(createdTab.id, {file: "content.js"});
		chrome.storage.local.set({'contSplit':contSplit, 'curIndex':curIndex}, function(){
			updateActive(curIndex);
		});
	});
}

function showCsv(){

	if(activeId == contSplit[curIndex][2]){
      var element = document.getElementById('csvStrg');
    	var rtrnStrg = "";
    	for(i=0;i<contSplit.length;i++){
    		rtrnStrg = rtrnStrg + contSplit[i].slice(0,2).join() + "\n";
    	}
    	element.innerHTML = rtrnStrg;
    	element.show();

	}

}

