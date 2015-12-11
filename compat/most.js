var Angular = require('angular');
var Most = require('most');

module.exports = require('../src/angular-observe.js');

Angular.module(module.exports)
    .config(['asyncBindConfigProvider', function (config) {
        config.fromPromise = Most.fromPromise;
        config.fromValue = Most.of;
        config.map = Most.map;
        config.switchMap = Most.switchLatest;
    }]);