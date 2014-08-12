function displayPath(entry) {
  chrome.fileSystem.getDisplayPath(entry, function(path) {
    console.log('path =', path);
  })
}

(function(_, g, u) {
  typeOf = function(o, p) {
    o = o === g
      ? "global"
      : o == u
        ? o === u
          ? "undefined"
          : "null"
        : _.toString.call(o).slice(8, -1);
    return p ? p === o : o;
  };
})({}, this);

function bindButtons() {
  btnDirectory.onclick = chooseDirectory;
}

function chooseDirectory() {
  chrome.fileSystem.chooseEntry({type:'openDirectory'}, function(entry) {
    if (arguments.length) {
      var dirId = chrome.fileSystem.retainEntry(entry);
      chrome.storage.local.set({'directory_id': dirId});
      chrome.fileSystem.getDisplayPath(entry, function(path) {
        txtDirectory.value = path;
      });
    }
  });
}

function loadDirectory() {
  chrome.storage.local.get('directory_id', function(item) {
    if (item.directory_id) {
      chrome.fileSystem.restoreEntry(item.directory_id, function(entry) {
        chrome.fileSystem.getDisplayPath(entry, function(path) {
          txtDirectory.value = path;
        });
      });
    }
  });
}

window.onload = function() {
  loadDirectory();
  bindButtons();
};