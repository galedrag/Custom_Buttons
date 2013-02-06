// http://infocatcher.ucoz.net/js/cb/mergeButtons.js

// Merge Buttons button for Custom Buttons
// (code for "initialization" section)

// (c) Infocatcher 2011
// version 0.1.0a1 - 2011-07-20

var buttons = [12, 16, "-", 18];

this.onmouseover = function(e) {
	if(e.target != this)
		return;
	Array.some(
		this.parentNode.getElementsByTagName("*"),
		function(node) {
			if(
				node != this
				&& node.namespaceURI == xulns
				&& node.boxObject
				&& node.boxObject instanceof Components.interfaces.nsIMenuBoxObject
				&& node.open
			) {
				node.open = false;
				this.open = true;
				return true;
			}
			return false;
		},
		this
	);
};

this.mergeButtons = {
	button: this,
	buttons: buttons,
	get mp() {
		var mp = this.button.appendChild(document.createElement("menupopup"));
		mp.setAttribute("onclick", "if(event.button != 2) closeMenus(this);");
		delete this.mp;
		return this.mp = mp;
	},
	_buttons: [],
	merge: function() {
		if(this._buttons.length)
			return;
		while(this.mp.hasChildNodes())
			this.mp.removeChild(this.mp.lastChild);
		this.buttons.forEach(function(id) {
			var item;
			if(id == "-")
				item = document.createElement("menuseparator");
			else {
				item = document.getElementById("custombuttons-button" + id);
				if(!item) {
					Components.utils.reportError(<>[Custom Buttons :: Merge Buttons] Button "{id}" not found!</>);
					return;
				}
				item.__mergeButtonsPosition = item.nextSibling;
				item.__mergeButtonsParent = item.parentNode;
				this._buttons.push(item);
			}
			this.mp.appendChild(item);
		}, this);
	},
	split: function() {
		if(!this._buttons.length)
			return;
		this._buttons.reverse().forEach(function(btn) {
			var insPos = btn.__mergeButtonsPosition;
			var insParent = btn.__mergeButtonsParent;
			if(insPos && insPos.parentNode != insParent)
				insPos = null;
			insParent.insertBefore(btn, insPos);
		});
		this._buttons.length = 0;
	},
	handleEvent: function(e) {
		if(e.type == "beforecustomization")
			this.split();
		//else if(e.type == "aftercustomization")
		//	this.merge();
	}
};

addEventListener("beforecustomization", this.mergeButtons, false);
//addEventListener("aftercustomization",  this.mergeButtons, false);
this.onDestroy = function() {
	this.mergeButtons.split();
};
//this.mergeButtons.merge();
setTimeout(function(_this) {
	_this.mergeButtons.merge();
}, 50, this);

this.type = "menu";
this.orient = "horizontal";

var sId = "__custombuttonsStyle__" + this.id; // Unique style "id"
var cssStr = <><![CDATA[
	%button% > menupopup toolbarbutton {
		-moz-box-orient: horizontal !important;
		-moz-appearance: menuitem !important;
	}
	%button% > menupopup .toolbarbutton-text {
		display: -moz-box !important;
		text-align: left !important;
		-moz-margin-start: 4px !important;
	}
	]]></>
	.toString()
	.replace(/%button%/g, "#" + this.id);
function sheet(cssStr, removeFlag) {
	var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"]
		.getService(Components.interfaces.nsIStyleSheetService);
	var ios = Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);
	var data = "data:text/css," + encodeURIComponent(cssStr);
	var uri = ios.newURI(data, null, null);
	if(sss.sheetRegistered(uri, sss.USER_SHEET))
		sss.unregisterSheet(uri, sss.USER_SHEET);
	if(removeFlag)
		return;
	sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
	window[sId] = cssStr;
}
if(!(sId in window))
	sheet(cssStr);
else if(window[sId] != cssStr) {
	sheet(window[sId], true);
	sheet(cssStr);
}