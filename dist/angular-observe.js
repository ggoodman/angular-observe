(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("angular"));
	else if(typeof define === 'function' && define.amd)
		define(["angular"], factory);
	else if(typeof exports === 'object')
		exports["AngularObserve"] = factory(require("angular"));
	else
		root["AngularObserve"] = factory(root["angular"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Angular = __webpack_require__(1);

	module.exports = 'filearts.angularObserve';

	var mod = Angular.module(module.exports, []);

	mod.directive('observe', ['$compile', '$timeout', function ($compile, $timeout) {
	    return {
	        restrict: 'EA',
	        scope: true,
	        transclude: {
	            loading: '?loading',
	            active: '?active',
	            complete: '?complete',
	            error: '?error',
	        },
	        link: function ($scope, $element, $attrs, ctl, $transclude) {
	            var currentState;
	            var stateLinkFunctions = {};
	            var source = $scope.$eval($attrs.observe || $attrs.source);
	            
	            if (!source) {
	                console.warn('The `observable` directive requires a source observable.');
	                return;
	            }
	            
	            // Subscribe to the observable
	            var observable = typeof source.subscribe === 'function'
	                ?   source
	                :   typeof source.then === 'function'
	                    ?   liftPromise(source)
	                    :   liftValue(source);
	            var subscription = observable.subscribe(onNext, onError, onComplete);
	            
	            $transclude(compileState.bind(null, 'active', false), null, '');
	            $transclude(compileState.bind(null, 'loading', true), null, 'loading');
	            $transclude(compileState.bind(null, 'active', true), null, 'active');
	            $transclude(compileState.bind(null, 'complete', true), null, 'complete');
	            $transclude(compileState.bind(null, 'error', true), null, 'error');
	            
	            if (!stateLinkFunctions.active) {
	                console.warn('The `observable` directive requires at least one child element.');
	            }
	            
	            setState('loading', true);

	            // Unsubscribe when this element is destroyed
	            $scope.$on('$destroy', function() {
	                subscription.unsubscribe();
	            });
	            
	            function onNext(val) {
	                $scope.$value = val;

	                setState('active');
	            }
	            
	            function onComplete(val) {
	                setState('complete');
	            }
	            
	            function onError(error) {
	                $scope.$error = error;
	                setState('error');
	            }
	            
	            function compileState(state, useContents, clone) {
	                var contents = useContents
	                    ?   clone.contents()
	                    :   clone;
	                
	                if (contents.length) {
	                    var linkFunction = $compile(contents);
	                
	                    stateLinkFunctions[state] = linkFunction;
	                }
	            }
	            
	            function liftPromise(source) {
	                return {
	                    subscribe: function (onNext, onError, onComplete) {
	                        source.then(onNext, onError, onNext)
	                            .catch(function (reason) {
	                                return reason;
	                            })
	                            .then(onComplete);
	                        
	                        return {
	                            unsubscribe: Angular.noop,
	                        };
	                    }
	                };
	            }
	            
	            function liftValue(source) {
	                return {
	                    subscribe: function (onNext, onError, onComplete) {
	                        $timeout(onNext.bind(null, source), 0, false)
	                            .then(onComplete);
	                        
	                        return {
	                            unsubscribe: Angular.noop,
	                        };
	                    }
	                };
	            }
	            
	            function setState(state, skipDigest) {
	                if (state !== currentState) {
	                    var linkFunction = stateLinkFunctions[state];
	                    
	                    if (!linkFunction) {
	                        return;
	                    }
	                    
	                    var replacement = linkFunction($scope);
	                    
	                    $element.empty();
	                    $element.append(replacement);
	                    
	                    currentState = state;
	                }
	                
	                if (!skipDigest && !$scope.$root.$$phase) {
	                    $scope.$digest(true);
	                }
	            }
	        }
	    };
	}]);

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }
/******/ ])
});
;