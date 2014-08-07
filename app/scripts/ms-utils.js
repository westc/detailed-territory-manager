function copyToClipboard(str) {
  clipboardData.setData('Text', str);
}

// Defines the necessary functions for easily handling files:
// saveFile(strPathname, strContents)
(function(fso) {
  var ForReading = 1;

  // Save a text file given the specified string as the contents.
  saveFile = function(strPathname, strContents) {
    var ts = fso.CreateTextFile(strPathname, true);
    ts.Write(strContents);
    ts.Close();
  };

  // Gets the date for the given file was last modified.
  getFileModDate = function(strPathname) {
    return new Date(fso.GetFile(strPathname).DateLastModified);
  };

  moveFile = function(strPathnameFrom, strPathnameTo) {
    fso.MoveFile(strPathnameFrom, strPathnameTo);
  };

  // Reads the text from the specified pathname.
  readFile = function(strPathname) {
    var ts = fso.OpenTextFile(strPathname, ForReading);
    var strContents = ts.ReadAll();
    ts.Close();
    return strContents;
  };

  deleteFile = function(strPathname) {
    fso.DeleteFile(strPathname);
  };

  // Determine if a file exists.
  fileExists = function(strPathname) {
    return fso.FileExists(strPathname);
  };
  
  fileToBase64 = function(filePath) {
    var inputStream = new ActiveXObject('ADODB.Stream');
    inputStream.Open();
    inputStream.Type = 1;  // adTypeBinary
    inputStream.LoadFromFile(filePath);
    var bytes = inputStream.Read();
    var dom = new ActiveXObject('Microsoft.XMLDOM');
    var elem = dom.createElement('tmp');
    elem.dataType = 'bin.base64';
    elem.nodeTypedValue = bytes;
    return elem.text.replace(/[^A-Z\d+=\/]/gi, ''); // remove added newlines
  };
})(new ActiveXObject('Scripting.FileSystemObject'));

// Provides MsgBox constants:
// http://cwestblog.com/2012/03/10/jscript-using-inputbox-and-msgbox/
(function(vbe) {
  vbe.Language = "VBScript";
  var constants = "OK,Cancel,Abort,Retry,Ignore,Yes,No,OKOnly,OKCancel,AbortRetryIgnore,YesNoCancel,YesNo,RetryCancel,Critical,Question,Exclamation,Information,DefaultButton1,DefaultButton2,DefaultButton3".split(",");
  for(var i = 0; constants[i]; i++) {
    this["vb" + constants[i]] = vbe.eval("vb" + constants[i]);
  }

  MsgBox = function(prompt, options, title) {
    return jsMsgBox(
      prompt != undefined ? prompt + '' : '',
      options || (vbOKOnly + vbExclamation),
      title != undefined ? title + '' : document.title
    );
  }
  
  document.write('<script language="VBScript">Function jsMsgBox(a,b,c):jsMsgBox=MsgBox(a,b,c):End Function</script>');
})(new ActiveXObject("ScriptControl"));

// For use with IWebBrowser2::ExecWB.  From:
// - http://msdn.microsoft.com/en-us/library/aa768360(v=vs.85).aspx
// - http://msdn.microsoft.com/en-us/library/ms683930(v=vs.85).aspx
var OLECMDID = { 
  OPEN: 1,
  NEW: 2,
  SAVE: 3,
  SAVEAS: 4,
  SAVECOPYAS: 5,
  PRINT: 6,
  PRINTPREVIEW: 7,
  PAGESETUP: 8,
  SPELL: 9,
  PROPERTIES: 10,
  CUT: 11,
  COPY: 12,
  PASTE: 13,
  PASTESPECIAL: 14,
  UNDO: 15,
  REDO: 16,
  SELECTALL: 17,
  CLEARSELECTION: 18,
  ZOOM: 19,
  GETZOOMRANGE: 20,
  UPDATECOMMANDS: 21,
  REFRESH: 22,
  STOP: 23,
  HIDETOOLBARS: 24,
  SETPROGRESSMAX: 25,
  SETPROGRESSPOS: 26,
  SETPROGRESSTEXT: 27,
  SETTITLE: 28,
  SETDOWNLOADSTATE: 29,
  STOPDOWNLOAD: 30,
  ONTOOLBARACTIVATED: 31,
  FIND: 32,
  DELETE: 33,
  HTTPEQUIV: 34,
  HTTPEQUIV_DONE: 35,
  ENABLE_INTERACTION: 36,
  ONUNLOAD: 37,
  PROPERTYBAG2: 38,
  PREREFRESH: 39,
  SHOWSCRIPTERROR: 40,
  SHOWMESSAGE: 41,
  SHOWFIND: 42,
  SHOWPAGESETUP: 43,
  SHOWPRINT: 44,
  CLOSE: 45,
  ALLOWUILESSSAVEAS: 46,
  DONTDOWNLOADCSS: 47,
  UPDATEPAGESTATUS: 48,
  PRINT2: 49,
  PRINTPREVIEW2: 50,
  SETPRINTTEMPLATE: 51,
  GETPRINTTEMPLATE: 52,
  PAGEACTIONBLOCKED: 55,
  PAGEACTIONUIQUERY: 56,
  FOCUSVIEWCONTROLS: 57,
  FOCUSVIEWCONTROLSQUERY: 58,
  SHOWPAGEACTIONMENU: 59,
  ADDTRAVELENTRY: 60,
  UPDATETRAVELENTRY: 61,
  UPDATEBACKFORWARDSTATE: 62,
  OPTICAL_ZOOM: 63,
  OPTICAL_GETZOOMRANGE: 64,
  WINDOWSTATECHANGED: 65,
  ACTIVEXINSTALLSCOPE: 66,
  UPDATETRAVELENTRY_DATARECOVERY: 67
};
var OLECMDEXECOPT = { 
  DODEFAULT: 0,
  PROMPTUSER: 1,
  DONTPROMPTUSER: 2,
  SHOWHELP: 3
};