
// utility functions that are used by seetabs
var ntutils = {

	// Return the string representation of list, but with good formatting.
	// Only print numitems per line.
	printformat: function(list, numitems) {
		numitems = numitems || 5;
		string = "";
		i = 1;
		for (l in list) {
			string += list[l] + ", ";
			if (i % numitems == 0) {
				string += "\n";
			}
			i++;
		}
		return string;
	},

	// return values in object
	dir: function(object) {
		stuff = [];
		for (s in object) {
			stuff.push(s);
		}
		stuff.sort();
		return stuff;
	},

	// Open a url in a new tab. Optionally make it active.
	// This returns a tab if it has been opened.
	// Warning: The tab may not be fully initialized, so you may
	// need to use call back functions on the tab.
	browse: function(url, makeactive) {
		if(!gBrowser) {
			return;
		}

		tab = gBrowser.addTab(url);
		if(makeactive) {
			gBrowser.selectedTab = tab
		}
		return tab;
	},

	// get a cookie name from host
	getcookie: function(host, name) {
		var cookie = null;
		var cookieManager2 = Components.classes["@mozilla.org/cookiemanager;1"].
			getService(Components.interfaces.nsICookieManager2);
		var cookies = cookieManager2.getCookiesFromHost(host);

		while (cookies.hasMoreElements()) {
			cookie = cookies.getNext();
			if (cookie instanceof Components.interfaces.nsICookie) {
				if (cookie.name == name) {
					return cookie;
					break;
				}
			}
		}
		return null;
	},

	// get the description in the element
	getdesc: function(doc) {
		if (!doc || !doc.head) {
			return "";
		}

		var metas = doc.head.getElementsByTagName('meta');
		for(var i = 0, mLen = metas.length; i < mLen; i++) {
			var attr = metas[i].getAttribute('name')
			if (attr) {
				if (attr.toLowerCase() == 'description') {
					var content = metas[i].getAttribute('content');
					if (content)
						return content;
				}
			}
		}

		return "";
	},
}

var seetabs = {

	// cookie for seetabs
	cookie: null, 

	// has this been initialized yet?
	initialized: false,

	// hostname to use when sending history to website
	host: "http://seetabs.com/",

	init: function() {
		if (this.initialized) {
			return;
		}

		// get the cookie from seetabs
		this.cookie = ntutils.getcookie("seetabs.com", "client_token");
		if (!this.cookie) {
			ntutils.browse("http://seetabs.com/newuser.php", true);
		}

		if (gBrowser) {
			//gBrowser.addEventListener("DOMContentLoaded", this.onPageLoad, false);

			var container = gBrowser.tabContainer;
			container.addEventListener("TabOpen", this.onTabOpen, false);
			container.addEventListener("TabMove", this.onTabMove, false);
			container.addEventListener("TabClose", this.onTabClose, false);
		}

		this.initialized = true;
		this.strings = document.getElementById("seetabs-strings");

		window.removeEventListener("load", function () { this.init(); }, false);
		window.addEventListener("unload", function () { this.uninit(); }, false);
	},

	uninit: function() {
		if (!this.initialized) {
			return;
		}

		this.cookie = null;

		if (gBrowser) {
			gBrowser.removeEventListener("DOMContentLoaded", this.onPageLoad, false);
		}

		this.initialized = false;
		window.removeEventListener("unload", function () { this.uninit(); }, false);
	},

	onMenuItemCommand: function(e) {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		.getService(Components.interfaces.nsIPromptService);
		promptService.alert(window, this.strings.getString("helloMessageTitle"),
							this.strings.getString("helloMessage"));
							promptService.alert(window, "Title what!!", "Body what!!");
	},

	onToolbarButtonCommand: function(e) {
		// just reuse the function above.  you can change this, obviously!
		seetabs.onMenuItemCommand(e);
	},

	onPageLoad: function(aEvent) {
		// document that triggered the event
		var doc = aEvent.originalTarget; 
		// window for the doc
		var win = doc.defaultView; 

		if (doc.nodeName != "#document") return; // only documents
		if (win != win.top) return; //only top window.
		if (win.frameElement) return; // skip iframes/frames

		var tabindex = gBrowser.getBrowserIndexForDocument(doc);

		seetabs.debuglala(doc.location.href, doc.title, ntutils.getdesc(doc), 
						  seetabs.cookie, tabindex, "onPageLoad");
		return;

		// firefox will open file://, chrome://, and about: pages, but we don't 
		// want to save those in our history.  These pages also won't have a description.
		if (doc.location.protocol == "http:" || doc.location.protocol == "https:") {
			seetabs.recordVisit(doc.location.href, doc.title, ntutils.getdesc(doc), seetabs.cookie);
		}
	},

	onTabOpen: function(aEvent) {
		seetabs.onTabDebug(aEvent, "onTabOpen");
	},

	onTabMove: function(aEvent) {
		seetabs.onTabDebug(aEvent, "onTabMove");
	},

	onTabClose: function(aEvent) {
		seetabs.onTabDebug(aEvent, "onTabClose");
	},

	onTabDebug: function(aEvent, from) {
		var tab = aEvent.target;
		var browser = gBrowser.getBrowserForTab(tab);
		var doc = browser.contentDocument;
		var win = doc.defaultView; 

		//if (doc.nodeName != "#document") return; // only documents
		//if (win != win.top) return; //only top window.
		//if (win.frameElement) return; // skip iframes/frames

		var tabindex = gBrowser.getBrowserIndexForDocument(doc);
		//var tabindex = tab.tabIndex;

		seetabs.debuglala(doc.location.href, doc.title, ntutils.getdesc(doc), 
						  seetabs.cookie, tabindex, from);
		return;
	},

	recordVisit: function(url, title, description, cookie) {
		//alert("Recording visit: " + encodeURI(url) + ", title: " + escape(title) + 
		//	 ", description: " + description);
		if (!cookie) {
			seetabs.cookie = ntutils.getcookie("seetabs.com", "client_token");
			cookie = seetabs.cookie;
		}
		var req = new XMLHttpRequest();
		req.open(
			"GET",
			seetabs.host+"interface/record.php?" +
				"client_token=" + cookie.value +
				"&url=" + encodeURI(url) +
				"&title=" + escape(title) +
				"&description=" + escape(description),
			true);
		req.onload = null;
		req.send(null);
	},

	debuglala: function(url, title, description, cookie, tabindex, from) {
		alert("debug: " + url + ", title: " + title + ", description: " + description +
			  ", tabindex: " + tabindex + ", from: " + from);
	},
};

window.addEventListener("load", function () { seetabs.init(); }, false);

