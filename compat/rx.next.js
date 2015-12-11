var Angular = require('angular');
var Rx = require('@reactivex/rx');

module.exports = require('../src/angular-observe.js');

Angular.module(module.exports)
    .config(['asyncBindConfigProvider', function (config) {
        config.fromPromise = Rx.Observable.fromPromise;
        config.fromValue = Rx.Observable.of;
        config.map = Rx.Observable.prototype.map;
        config.switchMap = Rx.Observable.prototype.switchMap;
    }]);