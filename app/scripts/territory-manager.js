var APP_PATH = territoryManager.commandLine.replace(/^"|".*$/g, '').replace(/\\/g, '/');
var APP_DIR_PATH = APP_PATH.replace(/[^/]+$/, '');
var DATA_DIR_PATH = APP_DIR_PATH + 'datos/';
var DATA_PATH = DATA_DIR_PATH + 'actual.js';
var SCRIPTS_DIR_PATH = APP_DIR_PATH + 'scripts/';
var IMAGES_DIR_PATH = APP_DIR_PATH + 'images/';
var PRINTOUTS_DIR_PATH = APP_DIR_PATH + 'printouts/';

var terrs;

var undoHistoryIndex = 0;
var undoHistory = [];
function addToHistory(fn) {
  undoHistory.splice(undoHistoryIndex, undoHistory.length - undoHistoryIndex, curry.apply(this, arguments));
  undoHistoryIndex++;
}

// Sets up references for all of the DOM elements that will need to referenced
// in JavaScript.
var divNormal, selectTerrs, divAddresses,
    divError, divErrorTitle, divErrorMsg, divErrorBtns,
    btnAddTerr, btnSave, btnPrint, btnClose;
function refDOMElems() {
  divNormal = Sizzle('#divNormal')[0];
  selectTerrs = Sizzle('#selectTerrs')[0];
  divAddresses = Sizzle('#divAddresses')[0];
  divError = Sizzle('#divError')[0];
  divErrorTitle = Sizzle('#divErrorTitle')[0];
  divErrorMsg = Sizzle('#divErrorMsg')[0];
  divErrorBtns = Sizzle('#divErrorBtns')[0];
  btnAddTerr = Sizzle('#btnAddTerr')[0];
  btnSave = Sizzle('#btnSave')[0];
  btnPrint = Sizzle('#btnPrint')[0];
  btnClose = Sizzle('#btnClose')[0];
}

/**
 * Load the territory data from the JSON data file.
 * @return {boolean}  Returns true if the territories were successfully loaded
 *     into memory.  False is returned if an error occurs.
 */
function loadTerrs() {
  var buttonsError = {
    Reintentar: function() {
      if(loadTerrs()) {
        hideError();
      }
    },
    Salir: function() {
      window.close();
    }
  };

  // If the data file doesn't exist it is time to show the error and end prog.
  if(!fileExists(DATA_PATH)) {
    return showError('Archivo de datos no existe', // title
      'El archivo de datos debe estar en "' + DATA_PATH + '", pero no est\xE1.', // msg
      buttonsError // buttons
    );
  }

  // Read the JSON from the file and process it.
  try {
    var strData = readFile(DATA_PATH);
    terrs = JSON.parse(strData);

  }
  catch(e) {
    return showError('Error encontrado con el archivo', // title
      'El siguiente error sucedi\xF3:  ' + e.message, // message
      buttonsError // buttons
    );
  }

  refreshTerrList();
  return true;
}

/**
 * Shows an error within the app.
 * @return {boolean}  Always returns false.
 */
function showError(title, msg, buttons) {
  addClass(divNormal, 'no-display', true);
  removeClass(divError, 'no-display', true);
  divErrorTitle.innerText = title;
  divErrorMsg.innerText = msg;
  divErrorBtns.innerHTML = '';
  eachProperty(buttons, function(buttonName, fnButton) {
    if(typeOf(fnButton, 'Function')) {
      divErrorBtns.appendChild(dom({
        nodeName: 'button',
        innerText: buttonName,
        onclick: fnButton
      }));
    }
  });
  return false;
}

// Hides the error and restores the normal content.
function hideError() {
  addClass(divError, 'no-display', true);
  removeClass(divNormal, 'no-display', true);
}

function setupBindings() {
  selectTerrs.onchange = terrSelChange;

  btnAddTerr.onclick = curry(verifyNotEditing, addTerr);

  btnSave.onclick = curry(verifyNotEditing, saveTerr);

  btnPrint.onclick = printTerrs;

  btnClose.onclick = curry(verifyNotEditing, closeApp);
}

function closeApp() {
  var response = MsgBox(SETTINGS.DIALOG_CLOSE_AND_SAVE_MESSAGE,
    vbYesNoCancel + vbExclamation, SETTINGS.DIALOG_CLOSE_AND_SAVE_TITLE);
  if(response != vbCancel) {
    if(response == vbYes) {
      saveTerr();
    }
    window.close();
  }
}

function printTerrs() {
  var terrsToPrint = [];
  eachSelectedTerr(function(terrNo, terr) {
    var addrs = [];
    forEach(terr.addresses, function(address) {
      if(!address.flag) {
        addrs.push(address);
      }
    });
    terrsToPrint.push({ number: terrNo, name: terr.name, addresses: addrs });
  });

  var options = {};

  var bgImagePath = IMAGES_DIR_PATH + SETTINGS.PRINTOUT_BACKGROUND_IMAGE;
  if (bgImagePath && fileExists(bgImagePath)) {
    try {
      options.bgImage = 'data:image/png;base64,' + fileToBase64(bgImagePath);
    }
    catch(e) {
      alert(e.message);
    }
  }

  // Read the code from "script/print.html", embed the territories to print and
  // embed the external scripts.
  var code = readFile(SCRIPTS_DIR_PATH + 'print.html');
  code = code.replace('[/*TERR INSERTION*/]', JSON.stringify(terrsToPrint));
code = code.replace('{/*TERR OPTIONS*/}', JSON.stringify(options));
  code = code.replace(
    /<script [^>]*src="([^"]+)"[^>]*>.*?<\/script>/gi,
    function(match, path) {
      return '<script type="text/JavaScript">'
        + readFile(SCRIPTS_DIR_PATH + path) + '</script>';
    }
  );

  // Save the printout page in the printouts folder.
  var printoutName = (new Date).format("YYYY-MM-DD 'at' HH.mm.ss.'html'");
  var printoutPath = PRINTOUTS_DIR_PATH + printoutName;
  saveFile(printoutPath, code);

  // Open the printout.
  (new ActiveXObject('WScript.Shell')).Run('"' + printoutPath + '"');

  // Allows for the dialog format strings to be expanded.
  var objExpand = {
    FILE_NAME: printoutName,
    FILE_DIR: PRINTOUTS_DIR_PATH,
    FILE_PATH: printoutPath
  };

  // Ask the user if the printout should be deleted.
  var answer = MsgBox(
    SETTINGS.DIALOG_DELETE_PRINTOUT_FILE_MESSAGE_FORMAT.expand(objExpand),
    vbYesNo + vbQuestion,
    SETTINGS.DIALOG_DELETE_PRINTOUT_FILE_TITLE
  );

  if(answer == vbYes) {
    deleteFile(printoutPath);
  }
  else {
    copyToClipboard(printoutPath);
    MsgBox(
      SETTINGS.DIALOG_PRINTOUT_PATH_COPIED_MESSAGE_FORMAT.expand(objExpand),
      vbOKOnly + vbInformation,
      SETTINGS.DIALOG_PRINTOUT_PATH_COPIED_TITLE
    );
  }
}

function expandTerrTitle(title, terrNo) {
  return title.expand({
    TERRITORY_NUMBER: terrNo,
    TERRITORY_NAME: terrs[terrNo].name,
    TOTAL_ADDRESSES: terrs[terrNo].addresses.length,
    TOTAL_FLAGGED: filter(terrs[terrNo].addresses, function(addr) {
      return addr.flag;
    }).length,
    TOTAL_UNFLAGGED: filter(terrs[terrNo].addresses, function(addr) {
      return !addr.flag;
    }).length
  });
}

function refreshTerrList() {
  var selectedTerrs = {};
  var selectedOpts = Sizzle('option:selected', selectTerrs);
  for(var i = selectedOpts.length; i-- && (selectedTerrs[selectedOpts[i].value] = 1););
  selectTerrs.innerHTML = '';
  eachProperty(terrs, function(terrNo, terr) {
    selectTerrs.appendChild(dom({
      nodeName: 'option',
      value: terrNo,
      innerText: expandTerrTitle(SETTINGS.LEFT_MENU_TERRITORIES_LIST_FORMAT, terrNo),
      selected: !!selectedTerrs[terrNo]
    }));
  });
}

function refreshAddressList() {
  var scrollTop = divAddresses.scrollTop;
  terrSelChange();
  divAddresses.scrollTop = scrollTop;
}

function terrSelChange() {
  // Clear the house list.
  divAddresses.innerHTML = '';

  eachSelectedTerr(appendTerr);
}

function eachSelectedTerr(fnCallback) {
  var opts = selectTerrs.options;
  for(var i = 0, len = opts.length; i < len; i++) {
    var opt = opts[i];
    if(opt.selected) {
      fnCallback(opt.value, terrs[opt.value]);
    }
  }
}

function addTerr() {
  MsgBox(SETTINGS.ERROR_MISSING_FUNCTIONALITY_MESSAGE, vbOKOnly + vbCritical);
}

function saveTerr() {
  moveFile(
    DATA_PATH,
    DATA_DIR_PATH + getFileModDate(DATA_PATH).format("YYYY-MM-DD (HH.mm.ss).'js'")
  );
  saveFile(DATA_PATH, JSON.stringify(terrs));
}

function insertAddress(terrNo, addressIndex) {
  var addrsToAddTo = terrs[terrNo].addresses;

  var checkboxes = Sizzle('#divAddresses div.address input.checkbox:checked');

  // If addresses are to be inserted here.
  if(checkboxes.length) {
    var addrsToAdd = [];

    var i = checkboxes.length;
    while(i-- > 0) {
      var terrNoToMoveFrom = checkboxes[i].value.split('.');
      var addrIndexToMoveFrom = terrNoToMoveFrom[1];
      terrNoToMoveFrom = +terrNoToMoveFrom[0];
      addrsToAdd.unshift(terrs[terrNoToMoveFrom].addresses.splice(addrIndexToMoveFrom, 1)[0]);
      if(terrNo == terrNoToMoveFrom && addressIndex > addrIndexToMoveFrom) {
        addressIndex--;
      }
    }

    // Move the addresses into the specified place.
    addrsToAddTo.splice.apply(addrsToAddTo, [addressIndex, 0].concat(addrsToAdd));

    // Refresh the address list.
    refreshAddressList();

    addToHistory(undoInsertAddress, terrNo, addressIndex);
  }
  // If a new address is to be inserted here.
  else {
    addrsToAddTo.splice(addressIndex, 0, {house: '', street: '', details: ''});

    refreshAddressList();

    Sizzle('#editAddress' + terrNo + '-' + addressIndex)[0].onclick(true);
  }
}

function undoInsertAddress(terrNo, addressIndex) {
  throw new Error('No está programada ya.');
}

function createEditInput(id, value, placeholder, fnSubmit, fnCancel) {
  return {
    nodeName: 'input',
    type: 'text',
    id: id,
    className: 'text' + (value ? '' : ' unset'),
    placeholder: placeholder,
    realValue: value,
    value: value || placeholder,
    onkeydown: function(e) {
      switch((e || window.event).keyCode) {
        case 13: this.onblur(); fnSubmit(); break;
        case 27: fnCancel(); break;
      }
    },
    onfocus: function() {
      if(this.value == placeholder) {
        this.value = '';
        this.className = 'text';
      }
    },
    onblur: function() {
      if(!(this.realValue = this.value = this.value.trim())) {
        this.value = placeholder;
        this.className = 'text unset';
      }
    }
  };
}

function validateAddress(terrNo, addressIndex, isNewAddress) {
  var house = Sizzle('#txtHouse')[0].realValue;
  var apt = Sizzle('#txtApt')[0].realValue;
  var street = Sizzle('#txtStreet')[0].realValue;
  var details = Sizzle('#txtDetails')[0].realValue;

  var errors = [];

  var terr = terrs[terrNo];
  var address = terr.addresses[addressIndex];

  var objExpand = {
    TERRITORY_NUMBER: terrNo,
    TERRITORY_NAME: terr.name,
    HOUSE: address.house,
    APT: address.apt,
    STREET: address.street,
    DETAILS: address.details,
    NEW_HOUSE: house,
    NEW_APT: apt,
    NEW_STREET: street,
    NEW_DETAILS: details
  };

  if(!house) {
    errors.push(SETTINGS.ERROR_MISSING_HOUSE_MESSAGE_FORMAT.expand(objExpand));
  }
  if(!street) {
    errors.push(SETTINGS.ERROR_MISSING_STREET_MESSAGE_FORMAT.expand(objExpand));
  }

  if(errors.length) {
    MsgBox(
      (
        SETTINGS.ERROR_ADDRESS_VALIDATION_TITLE_FORMAT
          ? SETTINGS.ERROR_ADDRESS_VALIDATION_TITLE_FORMAT.expand(objExpand)
            + '\n'
          : ''
      ) + errors.join('\n'),
      vbOKOnly + vbExclamation,
      SETTINGS.ERROR_ADDRESS_VALIDATION_TITLE_FORMAT.expand(objExpand)
    );
  }
  else {

    terrs[terrNo].addresses[addressIndex] = {
      house: house,
      apt: apt,
      street: street,
      details: details
    };

    fillAddrElem(terrNo, addressIndex);

    addToHistory(undoEditAddress, terrNo, addressIndex, address, isNewAddress);
  }
}

function validateTerr(terrNo, isNewTerr) {
  var newTerrNo = Sizzle('#txtTerrNo')[0].realValue;
  var newTerrName = Sizzle('#txtTerrName')[0].realValue;

  var errors = [];

  var objExpand = {
    CURRENT_TERRITORY_NUMBER: terrNo,
    CURRENT_TERRITORY_NAME: terrs[terrNo].name,
    NEW_TERRITORY_NUMBER: newTerrNo,
    NEW_TERRITORY_NAME: newTerrName,
    TERRITORY_NUMBER: newTerrNo,
    TERRITORY_NAME: newTerrNo in terrs ? terrs[newTerrNo].name : undefined
  };

  if(!newTerrNo) {
    errors.push(SETTINGS.ERROR_MISSING_TERRITORY_NUMBER_MESSAGE_FORMAT);
  }
  else if(terrNo != newTerrNo && terrs.hasOwnProperty(newTerrNo)) {
    errors.push(SETTINGS.ERROR_TERRITORY_NUMBER_CONFLICT_MESSAGE_FORMAT.expand(objExpand));
  }
  if(!newTerrName) {
    errors.push(SETTINGS.ERROR_MISSING_TERRITORY_NAME_MESSAGE_FORMAT.expand(objExpand));
  }

  if(errors.length) {
    MsgBox(
      (
        SETTINGS.ERROR_TERRITORY_VALIDATION_MESSAGE_FORMAT
          ? SETTINGS.ERROR_TERRITORY_VALIDATION_MESSAGE_FORMAT.expand(objExpand)
            + '\n'
          : ''
      ) + errors.join('\n'),
      vbOKOnly + vbExclamation,
      (SETTINGS.ERROR_TERRITORY_VALIDATION_TITLE_FORMAT || '').expand(objExpand)
    );
  }
  else {
    var terrName = terrs[terrNo].name;
    (terrs[newTerrNo] = terrs[terrNo]).name = newTerrName;
    if (terrNo != newTerrNo) {
      Sizzle('option[value=' + terrNo + ']', selectTerrs)[0].value = newTerrNo;
      delete terrs[terrNo];
    }

    addToHistory(undoEditTerr, terrNo, terrName, isNewTerr);

    refreshTerrList();
    refreshAddressList();
  }
}

function verifyNotEditing() {
  var fieldsetEdit = Sizzle('#fieldsetEdit')[0];
  if(fieldsetEdit) {
    fieldsetEdit.scrollIntoView();
    MsgBox(
      'Tiene que terminar con lo que ya est\xE1 editando.',
      vbOKOnly + vbCritical,
      'Todav\xEDa editando'
    );
  }
  else {
    curry.apply(this, arguments)();
  }
}

function editAddress(terrNo, addressIndex, isNewAddress) {
  var address = terrs[terrNo].addresses[addressIndex];

  var divAddress = Sizzle('#address' + terrNo + '-' + addressIndex)[0];
  divAddress.innerHTML = '';

  var fnSubmit = curry(validateAddress, terrNo, addressIndex, isNewAddress);
  function fnCancel() {
    if(isNewAddress) {
      terrs[terrNo].addresses.splice(addressIndex, 1);
    }
    fillAddrElem(terrNo, addressIndex);
  }

  divAddress.appendChild(dom({
    nodeName: 'fieldset',
    id: 'fieldsetEdit',
    children: [
      createEditInput('txtHouse', address.house, 'N\xFAmero de casa - ej.  123', fnSubmit, fnCancel),
      createEditInput('txtApt', address.apt, 'N\xFAmero de apartamento - ej.  A', fnSubmit, fnCancel),
      createEditInput('txtStreet', address.street, 'Calle - ej.  Main St.', fnSubmit, fnCancel),
      createEditInput('txtDetails', address.details, 'Detalles - ej.  No hispano', fnSubmit, fnCancel),
      {
        nodeName: 'input',
        type: 'button',
        className: 'button',
        value: 'Continuar',
        onclick: fnSubmit
      },
      {
        nodeName: 'input',
        type: 'button',
        className: 'button',
        value: 'Cancelar',
        onclick: fnCancel
      }
    ]
  }));

  Sizzle('#txtHouse')[0].select();
}

function undoEditAddress(terrNo, addressIndex, address) {
  throw new Error('No está programada ya.');
}

function editTerr(terrNo, isNewTerr) {
  var divTerr = Sizzle('#divTerr' + terrNo)[0];
  divTerr.innerHTML = '';

  var fnSubmit = curry(validateTerr, terrNo, isNewTerr);
  function fnCancel() {
    if(isNewTerr) {
      delete terrs[terrNo];
    }
    refreshAddressList();
  }

  divTerr.appendChild(dom({
    nodeName: 'fieldset',
    id: 'fieldsetEdit',
    children: [
      createEditInput('txtTerrNo', terrNo, 'N\xFAmero de territorio - ej.  49', fnSubmit, fnCancel),
      createEditInput('txtTerrName', terrs[terrNo].name, 'Nombre de territorio - ej.  Souderton #3', fnSubmit, fnCancel),
      {
        nodeName: 'input',
        type: 'button',
        className: 'button',
        value: 'Continuar',
        onclick: fnSubmit
      },
      {
        nodeName: 'input',
        type: 'button',
        className: 'button',
        value: 'Cancelar',
        onclick: fnCancel
      }
    ]
  }));

  Sizzle('#txtTerrNo')[0].select();
}

function undoEditTerr(terrNo) {
  throw new Error('No está programada ya.');
}

function checkAllAddrs(terrNo) {
  var chkMaster = this;
  forEach(Sizzle(':checkbox.terrNo' + terrNo), function(checkbox) {
    checkbox.checked = chkMaster.checked;
  });
}

function validateTerrCheck(terrNo) {
  var total = 0;
  forEach(Sizzle(':checkbox.terrNo' + terrNo), function(checkbox) {
    total += +!checkbox.checked;
  });
  Sizzle('#chkTerr' + terrNo)[0].checked = total ? '' : 'checked';
}

function flagAddress(terrNo, addressIndex) {
  var addr = terrs[terrNo].addresses[addressIndex];
  if(addr.flag) {
    delete addr.flag;
  }
  else {
    addr.flag = 1;
  }
  
  fillAddrElem(terrNo, addressIndex);
}

function fillTerrTitleElem(terrNo, terrName, terrTitleElem) {
  // Clear the current content of the territory title element.
  terrTitleElem.innerHTML = '';

  insertBeforeNode(
    dom([
      {
        nodeName: 'input',
        type: 'checkbox',
        id: 'chkTerr' + terrNo,
        className: 'checkbox',
        onclick: curry(checkAllAddrs, terrNo)
      },
      {
        nodeName: 'a',
        className: 'edit',
        innerText: expandTerrTitle(SETTINGS.LISTING_TERRITORY_TITLE_FORMAT, terrNo),
        onclick: curry(verifyNotEditing, editTerr, terrNo)
      }
    ]),
    null,
    terrTitleElem
  );

  return terrTitleElem;
}

function fillAddrElem(terrNo, addressIndex, addrElem) {
  addrElem = addrElem || Sizzle('#address' + terrNo + '-' + addressIndex)[0];

  // Clear the current content of the address element.
  addrElem.innerHTML = '';

  // Add the elements to the address element.
  var addr = terrs[terrNo].addresses[addressIndex];
  insertBeforeNode(
    dom([
      {
        nodeName: 'input',
        type: 'checkbox',
        className: 'checkbox terrNo' + terrNo,
        value: terrNo + '.' + addressIndex,
        onclick: curry(validateTerrCheck, terrNo)
      },
      {
        nodeName: 'a',
        id: 'editAddress' + terrNo + '-' + addressIndex,
        className: 'edit',
        onclick: curry(verifyNotEditing, editAddress, terrNo, addressIndex),
        innerText: addr.house + (addr.apt ? ' ' + addr.apt : '') + ' '
          + addr.street + (addr.details ? ' - ' + addr.details : '')
      },
      {
        nodeName: 'a',
        className: 'flag',
        onclick: curry(flagAddress, terrNo, addressIndex),
        innerText: addr.flag ? SETTINGS.UNFLAG_TEXT : SETTINGS.FLAG_TEXT
      }
    ]),
    null,
    addrElem
  );

  if(addr.flag) {
    addClass(addrElem, 'flagged', true);
  }
  else {
    removeClass(addrElem, 'flagged', true);
  }

  return addrElem;
}

function appendTerr(terrNo, terr) {
  var insertTerrAddress = curry(verifyNotEditing, insertAddress, terrNo);
  var editTerrAddress = curry(verifyNotEditing, editAddress, terrNo);

  divAddresses.appendChild(fillTerrTitleElem(terrNo, terr.name, dom({
    nodeName: 'div',
    id: 'divTerr' + terrNo,
    className: 'terrTitle'
  })));

  var addrs = terr.addresses;
  for(var i = 0, len = addrs.length; i < len; i++) {
    var addr = addrs[i];
    divAddresses.appendChild(dom({
      nodeName: 'hr',
      id: 'insertion' + terrNo + '-' + i,
      className: 'insertionPoint',
      onclick: curry(insertTerrAddress, i)
    }));
    divAddresses.appendChild(fillAddrElem(terrNo, i, dom({
      nodeName: 'div',
      id: 'address' + terrNo + '-' + i,
      className: 'address'
    })));
  }

  divAddresses.appendChild(dom({
    nodeName: 'hr',
    className: 'insertionPoint',
    onclick: curry(insertTerrAddress, i)
  }));
}

function loadSettings() {
  Sizzle('#legendTerr > span')[0].innerText
    = SETTINGS.LEFT_MENU_TERRITORIES_LABEL;

  Sizzle('#aTerrFiltersHelp')[0].onclick = function() {
    MsgBox(SETTINGS.LEFT_MENU_TERRITORIES_HINT, vbOKOnly + vbInformation,
      SETTINGS.LEFT_MENU_TERRITORIES_LABEL);
  };

  Sizzle('#btnAddTerr')[0].value = SETTINGS.LEFT_MENU_ADD_TERRITORY_BUTTON;

  btnPrint.value = SETTINGS.LEFT_MENU_PRINT_BUTTON;

  btnSave.value = SETTINGS.LEFT_MENU_SAVE_BUTTON;

  btnClose.value = SETTINGS.LEFT_MENU_CLOSE_BUTTON;
}

// Once the page loads, setup everything else.
window.onload = function() {
  // Setup the references for all of the DOM elements that need to referenced.
  refDOMElems();

  // Load in the values from settings.js.
  loadSettings();

  // Load the territories in the app.
  loadTerrs();

  // Setup bindings.
  setupBindings();
};