/**
 * Adds the specified class name to the given element.
 * @param {!DOMElement} elem  The element whose class name will be updated.
 * @param {string} className  The class name which should be added to the
 *     element.
 * @param {boolean=} onlyOnce  Optional - defaults to false.  If specified as
 *     true, the class name specified will only appear a maximum of one time.
 * @return {string}  The newly updated class.
 */
function addClass(elem, className, onlyOnce) {
  return !onlyOnce || hasClass(elem, className)
    ? elem.className = (elem.className + ' ' + className).trim()
    : elem.className;
}

/**
 * Checks to see if an element has a specified class name.
 * @param {!DOMElement} elem  The element whose class name will be checked.
 * @param {string} className  The class name to check for.
 * @return {boolean}  Returns true if the specified class name is found in the
 *     specified element's class name.
 */
function hasClass(elem, className) {
  return !(' ' + elem.className + ' ').indexOf(' ' + className + ' ') >= 0;
}

/**
 * Removes one or all instances of the specified class name from the given
 * element.
 * @param {!DOMElement} elem  The element whose class name will be updated.
 * @param {string} className  The class name which should be removed from the
 *     element.
 * @param {boolean=} removeAll  Optional - defaults to false.  If specified as
 *     true all instances of className will be removed from the elements class
 *     name.
 * @return {string}  The newly updated class.
 */
function removeClass(elem, className, removeAll) {
  return elem.className = (' ' + elem.className + ' ')
    ['replace' + (removeAll ? 'All' : '')](' ' + className + ' ', ' ').trim();
}

function forEach(arr, fnCallback) {
  for(var i = 0, len = arr.length; i < len; i++) {
    fnCallback.call(this, arr[i], i, arr);
  }
  return arr;
}

function filter(arr, fnCallback) {
  var arrRet = [];
  for(var i = 0, len = arr.length; i < len; i++) {
    if(fnCallback.call(this, arr[i], i, arr)) {
      arrRet.push(arr[i]);
    }
  }
  return arrRet;
}

(function(document, emptyArr, emptyObj, hasOwnProperty, regExpDash, innerText, textContent, undefined) {
  /**
   * Either gets the type of the specified object or determine if the type matches
   * the optionally given type name.
   * @param {?} obj  The object whose type will be determined.
   * @param {string=} typeName  Optional.  The type name to check against.
   * @return {boolean|string}  If the second parameter isn't given a string is
   *     returned indicating the type of the object.  If the second parameter is
   *     given, a boolean is returned indicating whether or not the given type
   *     name matches the type name of the object.
   */
  typeOf = function(obj, typeName) {
    obj = obj == undefined
      ? obj === undefined ? 'undefined' : 'null'
      : emptyObj.toString.call(obj).slice(8, -1);
    return typeName ? obj == typeName : obj;
  }

  /**
   * Predefines parameters that will be sent to the function and returns the
   * wrapper function.
   * @param {!Function} fn  The function whose parameters will be predefined.
   * @param {...*} var_args  Any arguments that you want to be sent to the
   *     function when it is called.
   * @return {!Function}  The specified function which the specified parameters
   *     setup to be sent to function once this returned function is called.
   *     Any additional parameters passed to this returned function will be
   *     passed in as the arguments after those already passed in.  In other
   *     words, if two were already predefined and then this function is called
   *     with one more, the original function will be called with three
   *     parameters.
   */
  curry = function(fn) {
    var args = emptyArr.slice.call(arguments, 1);
    return function() {
      return fn.apply(this, args.concat(emptyArr.slice.call(arguments, 0)));
    };
  };

  /**
   * Iterates over all of the properties of the specified object and returns an
   * array of their names.
   * @param {!Object} obj  The object whose properties will be iterated over.
   * @param {function(string, *):*=} fnCallback  Optional function callback
   *     which, if specified, will be called for each property found.  If when
   *     called it returns a truish value the corresponding property name will
   *     be added to the array of names returned.
   * @return {!Array.<string>}  The array of the names of the properties found.
   */
  eachProperty = function(obj, fnCallback) {
    var ret = [];
    for(var key in obj) {
      if (hasOwnProperty.call(obj, key) && (!fnCallback || fnCallback(key, obj[key]))) {
        ret.push(key);
      }
    }
    return ret;
  };

  /**
   * Takes a JS object and returns the corresponding DOM object.
   * @param {!Array|!Object|string} obj
   * @return {!DOMElement|!Array.<DOMElement>}
   */
  dom = function(obj) {
    var elem, typeName = typeOf(obj);
    if (typeName == 'Array') {
      elem = [];
      forEach(obj, function(o) { elem.push(dom(o)); });
    }
    else if (typeName == 'String') {
      div.innerHTML = obj;
      elem = [];
      forEach(div.childNodes, function(child) { elem.push(child); });
    }
    else {
      elem = this.document.createElement(obj.nodeName);
      for (var propName in obj) {
        var propValue = obj[propName];
        if (propName == 'style') {
          var style = elem[propName];
          if (typeOf(propValue, 'String')) {
            style.cssText = propValue;
          }
          else {
            eachProperty(propValue, function(stylePropName, stylePropValue) {
              style[stylePropName.replace(regExpDash, cap$1)] = propValue[stylePropName];
            });
          }
        }
        else if (propName == innerText || propName == textContent) {
          elem[textContent] = elem[innerText] = propValue;
        }
        else if (propName == 'children') {
          var child, i = 0;
          while (child = propValue[i++]) {
            child = dom(child);
            if (!typeOf(child, 'Array')) {
              child = [child];
            }
            var kid, j = 0;
            while (kid = child[j++]) {
              elem.appendChild(kid);
            }
          }
        }
        else if (propName != 'nodeName') {
          elem[propName] = propValue;
        }
      }
    }
    return elem;
  };
  
  function cap$1($0, $1) {
    return $1.toUpperCase();
  }
  
  var div = dom({nodeName:'DIV'});
})(document, [], {}, ({}).hasOwnProperty, /-([^-])/g, 'innerText', 'textContent');

/**
 * Replaces all instances of a string or RegExp with a string.
 * @param {string|!RegExp} target  The string or regular expression whose every
 *     instance in the string should be replaced with the replacment string.
 * @param {string} strReplacement  The string which will replacement every
 *     instance of the found string or regular expression.  Capture groups will
 *     not be recognized.
 * @return {string}  The new string with all instances of the target replaced.
 */
String.prototype.replaceAll = function(strTarget, strReplacement) {
  return this.split(strTarget).join(strReplacement);
};

// Removes the spaces from the beginning and end of the string.
String.prototype.trim = function() {
  // 2 replaces done for the sake of speed.
  return this.replace(/^[\s\u00A0]+/, '').replace(/[\s\u00A0]+$/, '');
};

// Date.prototype.format() - By Chris West - MIT Licensed
// http://cwestblog.com/2012/09/27/javascript-date-prototype-format/
(function() {
  var D = "domingo,lunes,martes,mi\u00E9rcoles,jueves,viernes,s\u00E1bado".split(","),
      M = "enero,febrero,marzo,abril,mayo,junio,julio,agosto,septiembre,octubre,noviembre,diciembre".split(",");
  //var D = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),
  //    M = "January,February,March,April,May,June,July,August,September,October,November,December".split(",");
  Date.prototype.format = function(format) {
    var me = this;
    return format.replace(/a|A|Z|S(SS)?|ss?|mm?|HH?|hh?|D{1,4}|M{1,4}|YY(YY)?|'([^']|'')*'/g, function(str) {
      var c1 = str.charAt(0),
          ret = str.charAt(0) == "'"
          ? (c1=0) || str.slice(1, -1).replace(/''/g, "'")
          : str == "a"
            ? (me.getHours() < 12 ? "am" : "pm")
            : str == "A"
              ? (me.getHours() < 12 ? "AM" : "PM")
              : str == "Z"
                ? (("+" + -me.getTimezoneOffset() / 60).replace(/^\D?(\D)/, "$1").replace(/^(.)(.)$/, "$10$2") + "00")
                : c1 == "S"
                  ? me.getMilliseconds()
                  : c1 == "s"
                    ? me.getSeconds()
                    : c1 == "H"
                      ? me.getHours()
                      : c1 == "h"
                        ? (me.getHours() % 12) || 12
                        : (c1 == "D" && str.length > 2)
                          ? D[me.getDay()].slice(0, str.length > 3 ? 99 : 3)
                          : c1 == "D"
                            ? me.getDate()
                            : (c1 == "M" && str.length > 2)
                              ? M[me.getMonth()].slice(0, str.length > 3 ? 99 : 3)
                              : c1 == "m"
                                ? me.getMinutes()
                                : c1 == "M"
                                  ? me.getMonth() + 1
                                  : ("" + me.getFullYear()).slice(-str.length);
      return c1 && str.length < 4 && ("" + ret).length < str.length
        ? ("00" + ret).slice(-str.length)
        : ret;
    });
  };
})();

/**
 * @license JS Polling - By Chris West - MIT License
 * http://cwestblog.com/2013/05/28/javascript-polling/
 */
(function(emptyObj, emptyArr, types, undefined) {
  /**
   * Polls every so often until a specific condition is true before running the
   * fnOnReady function.
   * @param {!function():boolean} fnIsReady  The function that will be executed
   *     every time the amount of milliseconds (interval) specified passes.
   *     This function should return true if the fnOnReady parameter is ready to
   *     be executed, otherwise false should be returned.  The parameters passed
   *     to this function will be those specified as args.
   * @param {!Function} fnOnReady  The function to be run once the polling has
   *     ceased without a timeout.  The parameters passed to this function will
   *     be those specified as args.
   * @param {?Function=} fnOnTimeout  The optional function to be run once the
   *     polling ceased due to the timeout limit being reached.  The parameters
   *     passed to this function will be those specified as args.
   * @param {?number=} interval  The optional amount of milliseconds to wait
   *     before executing the fnIsReady function again.  If not specified, this
   *     interval will default to 50.
   * @param {?number=} timeout  The optional amount of milliseconds to wait
   *     until the polling should stop.  This doesn't include the amount of time
   *     used to run fnIsReady.  Defaults to infinity if not specified.
   * @param {?Array=} args  The optional array of arguments to send to the
   *     functions:  fnIsReady, fnOnReady, and fnOnTimeout.
   */
  poll = function(fnIsReady, fnOnReady, fnOnTimeout, interval, timeout, args) {
    // Pre-process the arguments to account for optionals.
    var myArg, myArgs = emptyArr.slice.call(arguments, 2);
    var i = -1;
    while(myArg = myArgs[++i]) {
      if(myArg != undefined && typeOf(myArg) != types[i]) {
        myArgs.splice(i, 0, undefined);
      }
    }
    fnOnTimeout = myArgs[0];
    interval = myArgs[1] || 50;
    timeout = myArgs[2] || Infinity;
    args = myArgs[3] || emptyArr;
    
    function fnCaller() {
      var me = this;
      
      if(fnIsReady.apply(me, args)) {
        fnOnReady.apply(me, args);
      }
      else if((timeout -= interval) > 0) {
        setTimeout(fnCaller, interval);
      }
      else if(fnOnTimeout) {
        fnOnTimeout.apply(me, args);
      }
    }
    fnCaller();
  };
})({}, [], ['Function', 'Number', 'Number', 'Array']);


(function() {
  var img = new Image();
  getAbsPathFor = function(relativePath) {
    img.src = relativePath;
    return img.src;
  };
})();

function deleteTableRows(table, startRow, endRow) {
  var rowCount = table.rows.length;
  if(startRow < 0) {
    startRow += rowCount;
    if(startRow < 0) {
      startRow = 0;
    }
  }
  if(endRow < 0) {
    endRow += rowCount;
    if(endRow < 0) {
      endRow = 0;
    }
  }
  else if(endRow == undefined) {
    endRow = rowCount;
  }
  while(startRow <= --endRow) {
    table.deleteRow(endRow);
  }
}

function extend(objToExtend, objProps) {
  eachProperty(objProps, function(name, value) {
    objToExtend[name] = value;
  });
  return objToExtend;
}

function htmlspecialchars(str) {
  return str.replace(/[^\w,.\\\/<>?:";'{}|\[\]`~!@#$%^&*() +=-]/gi, function(match) {
    return '&#' + match.charCodeAt(0) + ';';
  });
}

// Modified from:
// http://cwestblog.com/2012/09/25/javascript-string-prototype-expand/
(function(global, nil) {

  // Precompile regular expression for the expand function.
  var reExpand = /\$\{\s*(?:(["'])((?:[^"']+|(?!\1)["']|\1\1)*)\1\s*,)?\s*([A-Z_$][\w$]*)\s*(?:,\s*(["'])((?:[^"']+|(?!\4)["']|\4\4)*)\4)?\s*\}/gi;

  String.prototype.expand = function(context, blankIfNotIn) {
    context = context == nil ? global : context;
    return this.replace(
      reExpand,
      function(all, prefixDelim, prefix, name, suffixDelim, suffix) {
        var isNameInContext = name in context;
        return (isNameInContext && context[name] != nil)
          ? (prefix || '').replaceAll(prefixDelim + prefixDelim, prefixDelim)
            + context[name]
            + (suffix || '').replaceAll(suffixDelim + suffixDelim, suffixDelim)
          : (isNameInContext || blankIfNotIn ? '' : all);
      }
    );
  };
})(this);

function hover(elem, mouseOverClass, mouseOutClass) {
  return extend(elem, {
    onmouseover: function() {
      mouseOutClass && removeClass(elem, mouseOutClass, true);
      addClass(elem, mouseOverClass, true);
    },
    onmouseout: function() {
      removeClass(elem, mouseOverClass, true);
      mouseOutClass && addClass(elem, mouseOutClass, true);
    }
  });
}

/**
 * Inserts one or more nodes before the specified node.
 * @param {!Array.<!Node>|!Node} toBeInserted  The node(s) to be inserted.
 * @param {Node=} nextSibling  Optional.  The node which should precede the node
 *     to be inserted.  If not given, the node(s) to be inserted will be
 *     appended to the parent node.
 * @param {Node=} parentNode  Optional.  The node that will be the parent of the
 *     new node(s).  If not given this defaults to the parent node of
 *     nextSibling.
 */
function insertBeforeNode(toBeInserted, nextSibling, parentNode) {
  nextSibling = nextSibling || null;
  parentNode = parentNode || nextSibling.parentNode;
  
  if(!typeOf(toBeInserted, 'Array')) {
    toBeInserted = [toBeInserted];
  }
  
  var elem, i = 0;
  while(elem = toBeInserted[i++]) {
    parentNode.insertBefore(elem, nextSibling);
  }
}

function addStylesheet(cssText) {
  var doc = document;
  var parent = doc.getElementsByTagName('head')[0] || doc.body;
  var style = doc.createElement('style');
  style.setAttribute('type', 'text/css');
  if (style.styleSheet) {
    style.styleSheet.cssText = cssText;
  }
  else {
    style.appendChild(doc.createTextNode(cssText));
  }
  parent.appendChild(style);
  return style;
}

RegExp.quote = function(aString) {
  return aString.replace(/([[\](){}.+*^$|\\?-])/g, "\\$1");
};

RegExp.escape = function(aString, regExpFlags) {
  return new RegExp(RegExp.quote(aString), regExpFlags);
};