var Angular = require('angular');

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
            var subscription;
            var isolateScope = $rootScope.$new(true, $scope);
            
            var sourceModel = $attrs.asyncBind || $attrs.source;
            
            $element.empty();
            
            $scope.$watch(sourceModel, function (source) {
                if (subscription) {
                    subscription.unsubscribe();
                }
                
                setState('loading');
                
                // Lift the source to an Observable-compatible interface
                var observable = source && typeof source.subscribe === 'function'
                    ?   source
                    :   source && typeof source.then === 'function'
                        ?   liftPromise(source)
                        :   liftValue(source);
                
                // Subscribe to the observable
                subscription = observable.subscribe(onNext, onError, onComplete);
            });
    
            // Unsubscribe when this element is destroyed
            $scope.$on('$destroy', function() {
                if (subscription) {
                    subscription.unsubscribe();
                }
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
                // I don't want to depend on any single Promise implementation
                // so I can't rely on re-throwing the error. Instead, I guard
                // on `failed` for the invocation of `onComplete`.
                var failed = false;
                
                var _onNext = function (val) {
                    onNext(val);
                    
                    return val;
                };
                
                var _onError = function (val) {
                    onError(val);
                    
                    failed = true;
                };
                
                var _onComplete = function () {
                    if (!failed) {
                        onComplete();
                    }
                };
                
                source.then(_onNext, _onError, onNext)
                    .then(_onComplete);
                
                return {
                    unsubscribe: Angular.noop,
                };
            }
        };
    }
    
    function liftValue(source) {
        return {
            subscribe: function (onNext, onError, onComplete) {
                // We are already using Angular so let's just leverage
                // an existing service (`$timeout`) to fire the `onNext` and
                // `onComplete` callbacks asynchronously.
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
