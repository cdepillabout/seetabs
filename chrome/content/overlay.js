var seetabs = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("seetabs-strings");
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
  }
};

window.addEventListener("load", function () { seetabs.onLoad(); }, false);
