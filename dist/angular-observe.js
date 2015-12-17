(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("angular"));
	else if(typeof define === 'function' && define.amd)
		define(["angular"], factory);
	else if(typeof exports === 'object')
		exports["AngularObserve"] = factory(require("angular"));
	else
		root["AngularObserve"] = factory(root["angular"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
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

	module.exports = __webpack_require__(1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Angular = __webpack_require__(2);

	module.exports = 'filearts.angularObserve';

	var mod = Angular.module(module.exports, []);

	mod.provider('asyncBindConfig', [function () {
	    this.fromValue = function () {
	        throw new Error('You need to overwrite `asyncBindConfig.fromValue`.');
	    };
	    
	    this.fromPromise = function () {
	        throw new Error('You need to overwrite `asyncBindConfig.fromPromise`.');
	    };
	    
	    this.map = function () {
	        throw new Error('You need to overwrite `asyncBindConfig.map`.');
	    };
	    
	    this.switchMap = function () {
	        throw new Error('You need to overwrite `asyncBindConfig.switchMap`.');
	    };
	    
	    this.$get = function () {
	        return this;
	    };
	}]);

	mod.directive('asyncBind', ['$compile', '$q', '$rootScope', '$timeout', 'asyncBindConfig', function ($compile, $q, $rootScope, $timeout, asyncBindConfig) {
	    return {
	        restrict: 'EA',
	        scope: true,
	        compile: compile,
	    };
	    
	    function compile(tElement, tAttrs) {
	        var sourceSpec = (tAttrs.asyncBind || tAttrs.source).split(/\s+as\s+/i);
	        var sourcePath = sourceSpec.shift().split('.');
	        var publishAlias = sourceSpec[0] || '$value';
	        var sourceModel = sourcePath.shift();
	        var stateLinkFunctions = getStateLinkFunctions(tElement, publishAlias);
	        
	        tElement.empty();
	        
	        return function postLink($scope, $element, $attrs) {
	            var childScope;
	            var currentState;
	            var subscription;
	            var isolateScope = $rootScope.$new(true, $scope);
	            
	            $scope.$watch(sourceModel, function (source) {
	                if (subscription) {
	                    subscription.unsubscribe();
	                    subscription = null;
	                }
	                
	                setState('loading');
	                        
	                subscription = follow(sourcePath.slice(), source).subscribe(onNext, onError, onComplete);
	                
	                function atPath(path) {
	                    var first = path.shift();
	                    var rest = path;
	                    
	                    return function (next) {
	                        var child = next[first];
	                        
	                        return child
	                            ?   follow(rest, child)
	                            :   asyncBindConfig.fromValue();
	                    };
	                }
	                
	                function follow(path, source) {
	                    var observable = lift(source);
	                    
	                    return path.length
	                        ?   asyncBindConfig.switchMap.call(observable, atPath(path))
	                        :   observable;
	                }
	            });
	    
	            // subscription when this element is destroyed
	            $scope.$on('$destroy', function() {
	                if (subscription) {
	                    subscription.unsubscribe();
	                    subscription = null;
	                }
	            });
	            
	            function onNext(val) {
	                var forceLink = !isPrimitive(isolateScope[publishAlias])
	                    || !isPrimitive(val);
	                
	                isolateScope[publishAlias] = val;
	    
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
	    
	    function lift(source) {
	        return source && typeof source.subscribe === 'function'
	            ?   source
	            :   source && typeof source.then === 'function'
	                ?   asyncBindConfig.fromPromise(source)
	                :   asyncBindConfig.fromValue(source);
	    }


	    function getStateLinkFunctions(tElement, publishAlias) {
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
	                case 'loading': return stateTemplates.loading.push.apply(stateTemplates.loading, node.childNodes);
	                case 'active': return stateTemplates.active.push.apply(stateTemplates.active, node.childNodes);
	                case 'error': return stateTemplates.error.push.apply(stateTemplates.error, node.childNodes);
	                case 'complete': return stateTemplates.complete.push.apply(stateTemplates.complete, node.childNodes);
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
	                template.push(document.createTextNode('{{' + publishAlias + '}}'));
	            }
	                
	            var active = Angular.element(template).clone();
	            var complete = Angular.element(template).clone();
	            
	            stateLinkFunctions.active = $compile(active);
	            stateLinkFunctions.complete = $compile(complete);
	        }
	        
	        return stateLinkFunctions;
	    }
	}]);


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }
/******/ ])
});
;