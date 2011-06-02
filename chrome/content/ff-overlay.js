seetabs.onFirefoxLoad = function(event) {
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ seetabs.showFirefoxContextMenu(e); }, false);
};

seetabs.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-seetabs").hidden = gContextMenu.onImage;
};

window.addEventListener("load", function () { seetabs.onFirefoxLoad(); }, false);
