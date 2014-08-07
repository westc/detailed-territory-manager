window.onload = function() {
  var today = (new Date).format(SETTINGS.RECORD_FOOTER_FORMAT.replace(/(\$\{\w+\})/g, "''$1''"));
  var cardNum = 0;
  var divCard, tableAddresses;

  setup = function(arrTerrs, options) {
    var instructionsElem = Sizzle('.instructions')[0];
    var instructionsHTML = instructionsElem.innerHTML;
    instructionsElem.innerHTML = '<h1 class="center">'
      + htmlspecialchars(SETTINGS.PRINTOUT_LOADING_MESSAGE) + '</h1>';

    if (options.bgImage) {
      addStylesheet('@media screen,print { div.card { background: url(' + options.bgImage + ') !important; } }');
    }

    // Start the loading process only after the loading message is actually
    // drawn on the screen.
    setTimeout(function() {
      Sizzle('.instructions')[0].innerHTML = instructionsHTML;

      instructionsElem.getElementsByTagName('h1')[0].innerHTML
        = htmlspecialchars(SETTINGS.PRINTOUT_INSTRUCTIONS_HEADER).trim().replace(/  /g, '&nbsp; ');
      instructionsElem.getElementsByTagName('p')[0].innerHTML
        = htmlspecialchars(SETTINGS.PRINTOUT_INSTRUCTIONS_TEXT).trim().replace(/  /g, '&nbsp; ');

      forEach(arrTerrs, showTerr);
    }, 0);
  }

  function showTerr(terr) {
    startCard(terr);
    var house, lastHouse, streetChanged, lastStreet, cardNumStart = cardNum;

    // Add each address to a sheet.
    forEach(terr.addresses, function(address) {

      // This for loop works in conjunction with the final if statement so as to
      // make sure that if an overflow of the sheet occurs, the address will be
      // added to the new sheet instead.
      for(var td, trStreet, trHouse, repeat = 1; repeat;) {
        if(streetChanged = (address.street != lastStreet)) {
          for(var i = 0; lastStreet && i < SETTINGS.RECORD_BLANKS_BEFORE_STREET; i++) {
            addBlankRow();
          }

          lastHouse = undefined;
          trStreet = tableAddresses.insertRow(tableAddresses.rows.length);
          td = trStreet.insertCell(0);
          td.className = 'street';
          td.colSpan = 2;
          td.innerHTML = htmlspecialchars(lastStreet = address.street);
        }
        trHouse = tableAddresses.insertRow(tableAddresses.rows.length);


        td = trHouse.insertCell(0);
        td.className = 'house';
        house = address.house;
        td.innerHTML = htmlspecialchars(
          SETTINGS.RECORD_HOUSE_NUMBER_FORMAT.expand({
            HOUSE: (SETTINGS.RECORD_REPEAT_SAME_HOUSE_NUMBER || streetChanged || lastHouse != house) ? house : '',
            APT: address.apt
          }, true)
        );
        lastHouse = house;

        td = trHouse.insertCell(1);
        td.className = 'details';
        td.innerHTML = formatDetails(htmlspecialchars(address.details || '\u00A0'));

        for(var i = 0; i < SETTINGS.RECORD_BLANKS_AFTER_EACH_HOUSE; i++) {
          addBlankRow();
        }

        // If this address causes the territory to overflow, delete the rows
        // added and start a new sheet.
        if(repeat = (divCard.scrollHeight > divCard.offsetHeight)) {
          deleteTableRows(
            tableAddresses,
            +!trStreet - 2 - SETTINGS.RECORD_BLANKS_AFTER_EACH_HOUSE - SETTINGS.RECORD_BLANKS_BEFORE_STREET
          );
          fillInBlanks();
          lastStreet = undefined;
          startCard(terr);
        }
      }
    });

    var blanksAtEnd = 0;
    while((blanksAtEnd += fillInBlanks()) < SETTINGS.RECORD_BLANKS_AT_END_OF_TERRITORY) {
      startCard(terr);
    }


    var cardTotal = cardNum - cardNumStart + 1;
    for(var num = 1; num <= cardTotal; num++, cardNumStart++) {
      Sizzle('#card' + cardNumStart + ' .page')[0].innerHTML = htmlspecialchars(SETTINGS.RECORD_PAGE_FORMAT.expand({
        CURRENT_SHEET: num,
        TOTAL_SHEETS: cardTotal
      }));
      Sizzle('#card' + cardNumStart + ' .footer')[0].innerHTML = htmlspecialchars(today.expand({
        CURRENT_SHEET: num,
        TOTAL_SHEETS: cardTotal,
        TERRITORY_NUMBER: terr.number,
        TERRITORY_NAME: terr.name
      }));
    }
  }

  function formatDetails(detailsHTML) {
    var insertions = [];

    var arr = SETTINGS.PRINTOUT_ITALIC_DETAILS;
    var boldStart = arr.length;
    forEach(arr.concat(SETTINGS.PRINTOUT_BOLD_DETAILS), function(formatter, index) {
      if (typeOf(formatter, 'String')) {
        formatter = RegExp.escape(formatter, 'gi');
      }
      var nodeStart = index < boldStart ? '<i>' : '<b>';
      var nodeEnd = nodeStart.replace('<', '</');
      detailsHTML.replace(formatter, function(match) {
        var start = arguments[arguments.length - 2];
        insertions.push([start, nodeStart], [start + match.length, nodeEnd]);
      });
    });

    forEach(
      insertions.sort(function(a, b) {
      return a[0] > b[0] ? -1 : (a[0] < b[0] ? 1 : 0);
      }),
      function(insertion) {
        detailsHTML = detailsHTML.slice(0, insertion[0]) + insertion[1]
          + detailsHTML.slice(insertion[0]);
      }
    );
    
    return detailsHTML;
  }

  function addBlankRow() {
    var tr = tableAddresses.insertRow(tableAddresses.rows.length);
    var td = tr.insertCell(0);
    td.className = 'house';
    td.innerHTML = '&nbsp;';
    td = tr.insertCell(1);
    td.className = 'details';
    td.innerHTML = '&nbsp;';
    return tr;
  }

  function fillInBlanks() {
    var tr, count = 0;
    while(divCard.scrollHeight <= divCard.offsetHeight) {
      tr = addBlankRow();
      count++;
    }
    if(tr) {
      deleteTableRows(tableAddresses, -1);
      count--;
    }
    return count;
  }
  

  function startCard(terr) {
    // if at a page break create a new page
    document.body.appendChild(divCard = dom({
      nodeName: 'div',
      className: 'card',
      id: 'card' + (++cardNum),
      children: [
        {
          nodeName: 'div',
          className: 'line',
          children: [{
            nodeName: 'table'
          }]
        },
        {
          nodeName: 'table',
          className: 'addresses'
        },
        {
          nodeName: 'div',
          className: 'line footer',
          // This is used as a placeholder so that the calculations for overflow
          // can be better approximated.
          innerHTML: htmlspecialchars(today.expand({
            CURRENT_SHEET: 99,
            TOTAL_SHEETS: 99,
            TERRITORY_NUMBER: terr.number,
            TERRITORY_NAME: terr.name
          }))
        }
      ]
    }));
  
    var tr, td;

    // Add a row to the first table in the sheet for the territory header data.
    tr = Sizzle('table', divCard)[0].insertRow(0);

    // Territory label
    td = tr.insertCell(0);
    td.className = 'label';
    td.innerHTML = htmlspecialchars(SETTINGS.RECORD_TERRITORY_LABEL);

    // Territory field
    td = tr.insertCell(1);
    td.className = 'underlined territory-id';
    td.innerHTML = htmlspecialchars(SETTINGS.RECORD_TERRITORY_FORMAT.expand({
      TERRITORY_NUMBER: terr.number,
      TERRITORY_NAME: terr.name,
    }));

    // Page label
    td = tr.insertCell(2);
    td.className = 'label';
    td.innerHTML = htmlspecialchars(SETTINGS.RECORD_PAGE_LABEL);

    // Page field
    td = tr.insertCell(3);
    td.className = 'underlined page';
    
    // Add the header row for the table of addresses.
    tr = (tableAddresses = Sizzle('table.addresses', divCard)[0]).insertRow(0);
    tr.className = 'header';

    // House number header
    td = tr.insertCell(0);
    td.className = 'house';
    td.innerHTML = htmlspecialchars(SETTINGS.RECORD_HOUSE_NUMBER_LABEL);

    // Details header
    td = tr.insertCell(1);
    td.className = 'details';
    td.innerHTML = htmlspecialchars(SETTINGS.RECORD_DETAILS_LABEL);
  }
};