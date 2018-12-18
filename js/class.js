/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */

(function() {
  var initializing = false;
  var fnTest = /xyz/.test(function() {
    xyz;
  })
    ? /\b_super\b/
    : /.*/;

  this.Class = function() {};

  Class.extend = function(prop) {
    var _super = this.prototype;

    initializing = true;
    var prototype = new this();
    initializing = false;

    for (var name in prototype) {
      prototype[name] = cloneObject(prototype[name]);
    }

    for (var name in prop) {
      prototype[name] =
        typeof prop[name] == "function" &&
        typeof _super[name] == "function" &&
        fnTest.test(prop[name])
          ? (function(name, fn) {
              return function() {
                var tmp = this._super;

                // Add a new ._super() method
                this._super = _super[name];

                var ret = fn.apply(this, arguments);
                this._super = tmp;

                return ret;
              };
            })(name, prop[name])
          : prop[name];
    }

    //  constructor
    function Class() {
      if (!initializing && this.init) {
        this.init.apply(this, arguments);
      }
    }

    Class.prototype = prototype;
    t;
    Class.prototype.constructor = Class;

    Class.extend = arguments.callee;

    return Class;
  };
})();

function cloneObject(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  var temp = obj.constructor();
  for (var key in obj) {
    temp[key] = cloneObject(obj[key]);

    if (key === "lockStrings") {
      Log.log(key);
    }
  }

  return temp;
}

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = Class;
}
