(function(EMPTY_OBJECT, global, undefined) {
  var rootDirEntry, historyDirEntry;
  var STORAGE_KEYS = {
    DIRECTORY: 'directory_id'
  };

  function displayPath(entry) {
    chrome.fileSystem.getDisplayPath(entry, function(path) {
      console.log('path =', path);
    })
  }

  function typeOf(o, p) {
    o = o === global
      ? "global"
      : o == undefined
        ? o === undefined
          ? "undefined"
          : "null"
        : EMPTY_OBJECT.toString.call(o).slice(8, -1);
    return p ? p === o : o;
  }

  function bindButtons() {
    btnDirectory.onclick = chooseDirectory;
  }

  function chooseDirectory() {
    chrome.fileSystem.chooseEntry({type:'openDirectory'}, function(entry) {
      if (arguments.length) {
        setDirectory(entry);
      }
    });
  }

  function setDirectory(entry) {
    // Hoist the directory entry.
    rootDirEntry = entry;

    // Get/save the ID to retain the directory entry.
    var obj = {};
    obj[STORAGE_KEYS.DIRECTORY] = chrome.fileSystem.retainEntry(entry);
    chrome.storage.local.set(obj);

    // Show directory path in UI.
    chrome.fileSystem.getDisplayPath(entry, function(path) {
      txtDirectory.value = path;
    });

    // Make sure settings.js and history/current.js are found.
    rootDirEntry.getFile('settings.json', { create: true }, function(entry) {

    });
    rootDirEntry.getDirectory('history', { create: true }, function(entry) {
      historyDirEntry = entry;
      historyDirEntry.getFile('current.json', { create: true }, function(entry) {
        var reader = new FileReader();
        reader.onload = function(e) {
          var text = e.target.result;
          territories = TerritoryCollection(text ? JSON.parse(text) : []);
        };
        reader.readAsText(entry);
      });
    });
  }

  function loadDirectory() {
    chrome.storage.local.get(STORAGE_KEYS.DIRECTORY, function(item) {
      if (item.directory_id) {
        chrome.fileSystem.restoreEntry(item.directory_id, setDirectory);
      }
    });
  }

  global.onload = function() {
    loadDirectory();
    bindButtons();
  };
})({}, this);
