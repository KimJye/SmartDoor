//Module exports

module.exports = function() {
  //Module load

  var Gpio = require("pigpio").Gpio;

  var microt = require("microtime-nodejs");

  var TransPost = require("/PostTrans");

  var TRIG, ECHO;

  // pin number

  TRIG = new Gpio(23, "out");

  ECHO = new Gpio(24, "in");

  //Process Sleep function

  function sleep(millseconds) {
    var start = new Date().getTime();

    for (var i = 0; i < 1e7; i++) {
      if (new Date().getTime() - start > millseconds) {
        break;
      }
    }
  }

  function checkDistance() {
    TRIG.digitalWrite(Gpio.LOW);

    sleep(0.2);

    TRIG.digitalWrite(Gpio.HIGH);

    sleep(2);

    TRIG.digitalWrite(Gpio.LOW);

    while (ECHO.digitalRead() == Gpio.LOW);

    var startTime = microt.now();

    while (ECHO.digitalRead() == Gpio.HIGH);

    var endTime = microt.now();

    var distance = (endTime - startTime) / 58;

    return Math.ceil(distance);
  }

  function getTime() {
    var now = new Date();

    //getMonth() (0~11)

    var nowAll =
      now.getFullYear() +
      "-" +
      (now.getMonth() + 1) +
      "-" +
      now.getDate() +
      " " +
      now.getHours() +
      ":" +
      now.getMinutes() +
      ":" +
      now.getSeconds() +
      " ";

    return nowAll;
  }

  function StartDistance() {
    var disArray = new Array(6);

    var DisTotal = 0;

    for (var i = 0; i < 6; i++) {
      disArray[i] = checkDistance();

      DisTotal += disArray[i];
    }

    var AvrDistance = Math.ceil(DisTotal / 6);

    setInterval(function() {
      var Msg = checkDistance();

      var Time = getTime();

      console.log("DISTANCE = ".yellow + Msg + " Cm".yellow + "  " + Time);

      var AvrDistanceDiv = AvrDistance / 6;

      if (Msg <= AvrDistance - AvrDistanceDiv) {
        var nowDistance = new Array();

        var inTotal = 0;

        var outTotal = 0;

        var i = 0;

        while (true) {
          nowDistance[i] = checkDistance();

          i++;

          if (checkDistance() >= AvrDistance) {
            break;
          }
        }

        for (var i = 0; i < nowDistance.length - 1; i++) {
          if (nowDistance[i] < nowDistance[i + 1]) {
            inTotal++;
          } else {
            outTotal++;
          }
        }

        if (inTotal > outTotal) {
          TransPost("Out", Time);

          console.log("Out Trans".red);

          sleep(3000);
        } else if (outTotal > inTotal) {
          TransPost("In", Time);

          console.log("In Trans".green);

          sleep(3000);
        }
      }
    }, 100);
  }

  StartDistance();
};
