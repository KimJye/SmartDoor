/* 
 * The Core App (Server)
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

//초음파 센서
var WaveDistance = require(__dirname + "/wave_distance.js");
WaveDistance();

var fs = require("fs");
var Server = require(__dirname + "/server.js");
var Utils = require(__dirname + "/utils.js");
var defaultModules = require(__dirname + "/../modules/default/defaultmodules.js");
var path = require("path");

// 버전 얻기
global.version = JSON.parse(fs.readFileSync("package.json", "utf8")).version;
console.log("Starting SmartDoor: v" + global.version);

// root path 전역
global.root_path = path.resolve(__dirname + "/../");

if (process.env.MM_CONFIG_FILE) {
	global.configuration_file = process.env.MM_CONFIG_FILE;
}


if (process.env.MM_PORT) {
	global.mmPort = process.env.MM_PORT;
}

process.on("uncaughtException", function (err) {
	console.log("Whoops! There was an uncaught exception...");
	console.error(err);
	console.log("SmartDoor will not quit, but it might be a good idea to check why this happened. Maybe no internet connection?");
	console.log("If you think this really is an issue, please open an issue on GitHub: https://github.com/MichMich/SmartDoor/issues");
});

/* App
 */
var App = function() {
	var nodeHelpers = [];

	/* 
		loadConfig(callback)
	 * config file로드. 
	 */

	var loadConfig = function(callback) {
		console.log("Loading config ...");
		var defaults = require(__dirname + "/defaults.js");

		var configFilename = path.resolve(global.root_path + "/config/config.js");
		if (typeof(global.configuration_file) !== "undefined") {
		    configFilename = path.resolve(global.configuration_file);
		}

		try {
			fs.accessSync(configFilename, fs.F_OK);
			var c = require(configFilename);
			checkDeprecatedOptions(c);
			var config = Object.assign(defaults, c);
			callback(config);
		} catch (e) {
			if (e.code == "ENOENT") {
				console.error(Utils.colors.error("WARNING! Could not find config file. Please create one. Starting with default configuration."));
			} else if (e instanceof ReferenceError || e instanceof SyntaxError) {
				console.error(Utils.colors.error("WARNING! Could not validate config file. Please correct syntax errors. Starting with default configuration."));
			} else {
				console.error(Utils.colors.error("WARNING! Could not load config file. Starting with default configuration. Error found: " + e));
			}
			callback(defaults);
		}
	};

	var checkDeprecatedOptions = function(userConfig) {
		var deprecated = require(global.root_path + "/js/deprecated.js");
		var deprecatedOptions = deprecated.configs;

		var usedDeprecated = [];

		deprecatedOptions.forEach(function(option) {
			if (userConfig.hasOwnProperty(option)) {
				usedDeprecated.push(option);
			}
		});
		if (usedDeprecated.length > 0) {
			console.warn(Utils.colors.warn(
				"WARNING! Your config is using deprecated options: " +
				usedDeprecated.join(", ") +
				". Check README and CHANGELOG for more up-to-date ways of getting the same functionality.")
			);
		}
	}

	/* loadModule(module)
	 * 모듈들 로드
	 */
	var loadModule = function(module, callback) {

		var elements = module.split("/");
		var moduleName = elements[elements.length - 1];
		var moduleFolder =  __dirname + "/../modules/" + module;

		if (defaultModules.indexOf(moduleName) !== -1) {
			moduleFolder =  __dirname + "/../modules/default/" + module;
		}

		var helperPath = moduleFolder + "/node_helper.js";

		var loadModule = true;
		try {
			fs.accessSync(helperPath, fs.R_OK);
		} catch (e) {
			loadModule = false;
			console.log("No helper found for module: " + moduleName + ".");
		}

		if (loadModule) {
			var Module = require(helperPath);
			var m = new Module();

			if (m.requiresVersion) {
				console.log("Check SmartDoor version for node helper '" + moduleName + "' - Minimum version:  " + m.requiresVersion + " - Current version: " + global.version);
				if (cmpVersions(global.version, m.requiresVersion) >= 0) {
					console.log("Version is ok!");
				} else {
					console.log("Version is incorrect. Skip module: '" + moduleName + "'");
					return;
				}
			}

			m.setName(moduleName);
			m.setPath(path.resolve(moduleFolder));
			nodeHelpers.push(m);

			m.loaded(callback);
		} else {
			callback();
		}
	};

	/* loadModules(modules)
	 * 모듈들 로드
	 */
	var loadModules = function(modules, callback) {
		console.log("Loading module helpers ...");

		var loadNextModule = function() {
			if (modules.length > 0) {
				var nextModule = modules[0];
				loadModule(nextModule, function() {
					modules = modules.slice(1);
					loadNextModule();
				});
			} else {
				// All module들 로드
				console.log("All module helpers loaded.");
				callback();
			}
		};

		loadNextModule();
	};


	function cmpVersions(a, b) {
		var i, diff;
		var regExStrip0 = /(\.0+)+$/;
		var segmentsA = a.replace(regExStrip0, "").split(".");
		var segmentsB = b.replace(regExStrip0, "").split(".");
		var l = Math.min(segmentsA.length, segmentsB.length);

		for (i = 0; i < l; i++) {
			diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
			if (diff) {
				return diff;
			}
		}
		return segmentsA.length - segmentsB.length;
	}


	this.start = function(callback) {

		loadConfig(function(c) {
			config = c;

			var modules = [];

			for (var m in config.modules) {
				var module = config.modules[m];
				if (modules.indexOf(module.module) === -1 && !module.disabled) {
					modules.push(module.module);
				}
			}

			loadModules(modules, function() {
				var server = new Server(config, function(app, io) {
					console.log("Server started ...");

					for (var h in nodeHelpers) {
						var nodeHelper = nodeHelpers[h];
						nodeHelper.setExpressApp(app);
						nodeHelper.setSocketIO(io);
						nodeHelper.start();
					}

					console.log("Sockets connected & modules started ...");

					if (typeof callback === "function") {
						callback(config);
					}

				});
			});
		});
	};

	/* stop()
	 */
	this.stop = function() {
		for (var h in nodeHelpers) {
			var nodeHelper = nodeHelpers[h];
			if (typeof nodeHelper.stop === "function") {
				nodeHelper.stop();
			}
		}
	};


	process.on("SIGINT", () => {
		console.log("[SIGINT] Received. Shutting down server...");
		setTimeout(() => { process.exit(0); }, 3000);  // Force quit after 3 seconds
		this.stop();
		process.exit(0);
	});
};

module.exports = new App();
