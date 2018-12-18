var config = {
  address: "localhost",

  port: 8080,

  ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"],

  language: "ko",

  timeFormat: 12,

  units: "metric",

  modules: [
    {
      module: "alert"
    },

    {
      module: "updatenotification",

      position: "top_bar"
    },

    {
      module: "clock",

      position: "top_left",

      config: {
        dateFormat: "LL dddd"
      }
    },

    {
      module: "calendar",

      position: "top_left",

      config: {
        urgency: 21,

        fetchInterval: 3600000,

        calendars: [
          {
            url:
              "https://calendar.google.com/calendar/ical/ko.south_korea%23holiday%40group.v.calendar.google.com/public/basic.ics",

            symbol: "대한민국 공휴일"
          }
        ]
      }
    },

    {
      module: "currentweather",

      position: "top_right",

      config: {
        location: "Seoul, KR", //https://openweathermap.org/ 에서 지역을 찾으세요.

        locationID: "",

        appid: "8fa54dd5dc399bfdc0854879e45a7d48" //openweathermap.org의 API key를 입력하세요.
      }
    },

    {
      module: "weatherforecast",

      position: "top_right",

      config: {
        location: "Seoul, KR", //https://openweathermap.org/ 에서 지역을 찾으세요.

        locationID: "",

        appid: "8fa54dd5dc399bfdc0854879e45a7d48" //openweathermap.org의 API key를 입력하세요.
      }
    },

    {
      module: "compliments",

      position: "lower_third",

      config: {
        compliments: {
          anytime: [
            //아무때나

            "오늘도 좋은 하루!"
          ],

          morning: [
            //아침

            "좋은 아침!",

            "힘찬 아침!",

            "잘 잤나요?"
          ],

          afternoon: [
            //오후

            "안녕하세요!",

            "멋져요!",

            "잘 지내고 있나요!"
          ],

          evening: [
            //저녁

            "와우! 잘 지냈나요?",

            "멋져보이네요!",

            "반가워요!"
          ],

          day_sunny: [
            //맑은 낮
          ],

          day_cloudy: [
            //흐린 낮
          ],

          cloudy: [
            //흐림
          ],

          cloudy_windy: [
            //흐리고 바람
          ],

          showers: [
            //소나기
          ],

          rain: [
            //비
          ],

          thunderstorm: [
            //천둥번개
          ],

          snow: [
            //눈
          ],

          fog: [
            //안개
          ],

          night_clear: [
            //맑은 밤
            "night"
          ],

          night_cloudy: [
            //흐린 밤
            "cloudy night"
          ],

          night_showers: [
            //소나기 밤
          ],

          night_rain: [
            //비오는 밤
          ],

          night_thunderstorm: [
            //천둥번개 밤
          ],

          night_snow: [
            //눈오는 밤
          ],

          night_alt_cloudy_windy: [
            //흐리고 바람부는 밤
            "windy night"
          ]
        }
      }
    },

    {
      module: "MMM-NotificationTrigger",

      config: {
        useWebhook: true,

        triggers: [
          {
            trigger: "ASSISTANT_ACTION",

            triggerSenderFilter: function(sender) {
              if (sender.name == "MMM-AssistantMk2") {
                return true;
              } else {
                return false;
              }
            },

            triggerPayloadFilter: function(payload) {
              return true;
            },

            fires: [
              {
                fire: "SHOW_ALERT",

                payload: function(payload) {
                  return {
                    type: "notification",

                    title: payload[0].execution[0].type,

                    message: payload[0].execution[0].command
                  };
                }
              }
            ]
          },

          {
            trigger: "ASSISTANT_HOOK",

            fires: [
              {
                fire: "SHOW_ALERT",

                payload: function(payload) {
                  return {
                    title: "HOOK",

                    message: "Are you saying " + payload.hook + "?",

                    timer: 5000
                  };
                }
              }
            ]
          },

          {
            trigger: "HOTWORD_DETECTED",

            fires: [
              {
                fire: "HOTWORD_PAUSE"
              },

              {
                fire: "ASSISTANT_ACTIVATE",

                payload: function(payload) {
                  return {
                    profile: payload.hotword
                  };
                },

                delay: 200
              }
            ]
          },

          {
            trigger: "ASSISTANT_DEACTIVATED",

            fires: [
              {
                fire: "HOTWORD_RESUME"
              }
            ]
          }
        ]
      }
    },

    {
      module: "MMM-Hotword",

      config: {
        snowboy: [
          {
            hotwords: "smartmirror",

            file: "resources/models/smart_mirror.umdl",

            sensitivity: "6.0"
          }
        ]
      }
    },

    {
      module: "MMM-AssistantMk2",

      position: "top_center",

      config: {
        useScreen: true,

        deviceLocation: {
          coordinates: {
            latitude: 37.57,

            longitude: 126.98
          }
        },

        profiles: {
          default: {
            lang: "ko-KR"
          }
        }
      }
    }
  ]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/

if (typeof module !== "undefined") {
  module.exports = config;
}
