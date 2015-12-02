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

	mod.directive('asyncBind', ['$compile', '$q', '$rootScope', '$timeout', function ($compile, $q, $rootScope, $timeout) {
	    return {
	        restrict: 'EA',
	        scope: true,
	        compile: compile,
	    };
	    
	    function compile(tElement) {
	        var stateLinkFunctions = getStateLinkFunctions(tElement);
	        
	        return function postLink($scope, $element, $attrs) {
	            var childScope;
	            var currentState;
	            var isolateScope = $rootScope.$new(true, $scope);
	            var source = $scope.$eval($attrs.asyncBind || $attrs.source);
	            
	            $element.empty();
	            
	            if (!source) {
	                console.warn('The `observable` directive requires a source observable.');
	                return;
	            }
	            
	            setState('loading');
	            
	            // Subscribe to the observable
	            var observable = typeof source.subscribe === 'function'
	                ?   source
	                :   typeof source.then === 'function'
	                    ?   liftPromise(source)
	                    :   liftValue(source);
	            var subscription = observable.subscribe(onNext, onError, onComplete);
	    
	            // Unsubscribe when this element is destroyed
	            $scope.$on('$destroy', function() {
	                subscription.unsubscribe();
	            });
	            
	            function onNext(val) {
	                var forceLink = !isPrimitive(isolateScope.$value)
	                    || !isPrimitive(val);
	                
	                isolateScope.$value = val;
	    
	                setState('active', forceLink);
	                
	                function isPrimitive(object) {
	                    var type = typeof object;
	                    
	                    return type === 'boolean'
	                        || type === 'number'
	                        || type === 'string';
	                }
	            }
	            
	            function onComplete(val) {
	                setState('complete');
	            }
	            
	            function onError(error) {
	                isolateScope.$error = error;
	                
	                setState('error');
	            }
	            
	            function setState(state, forceLink) {
	                if (forceLink || state !== currentState) {
	                    var linkFunction = stateLinkFunctions[state];
	                    
	                    if (childScope) {
	                        childScope.$destroy();
	                    }
	                    
	                    
	                    if (!linkFunction) {
	                        $element.empty();
	                        return;
	                    }
	                    
	                    childScope = isolateScope.$new();
	                    currentState = state;
	                    
	                    linkFunction(childScope, function (clone) {
	                        $element.empty();
	                        $element.append(clone);
	                    });
	                }
	                
	                if (!isolateScope.$root.$$phase) {
	                    isolateScope.$digest(true);
	                }
	            }
	        };
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


	    function getStateLinkFunctions(tElement) {
	        var stateLinkFunctions = {};
	        var stateTemplates = {
	            loading: [],
	            active: [],
	            error: [],
	            complete: [],
	        };
	        var template = [];
	        
	        Angular.forEach(tElement.contents(), function (node) {
	            switch (node.nodeName.toLowerCase()) {
	                case 'loading': return stateTemplates.loading.push(node);
	                case 'active': return stateTemplates.active.push(node);
	                case 'error': return stateTemplates.error.push(node);
	                case 'complete': return stateTemplates.complete.push(node);
	                default: return template.push(node);
	            }
	        });
	        
	        var hasStateTemplates = false;
	        
	        Angular.forEach(stateTemplates, function (template, state) {
	            if (template.length) {
	                hasStateTemplates = true;
	                
	                var clone = Angular.element(template).clone();
	                
	                stateLinkFunctions[state] = $compile(clone);
	            }
	        });
	        
	        if (!hasStateTemplates) {
	            if (!template.length) {
	                template.push(document.createTextNode('{{$value}}'));
	            }
	                
	            var clone = Angular.element(template).clone();
	            
	            stateLinkFunctions.active = $compile(clone);
	            stateLinkFunctions.complete = $compile(clone.clone());
	        }
	        
	        return stateLinkFunctions;
	    }

	}]);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }
/******/ ])
});
;