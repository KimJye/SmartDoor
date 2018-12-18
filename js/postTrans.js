(module.exports = function(detected, time) {
  var request = require("request");

  request = {
    url: "http://localhost:8080",

    qs: {
      data1: detected,

      data2: time
    }
  };

  method = POST;
}),
  function(err, res, body) {
    if (err) {
      return console.log("Error: ".red + err);
    }

    if (res.statusCode !== 200) {
      return console.log("Err! res.statusCode : ".red + res.statusCode);
    }
  };
