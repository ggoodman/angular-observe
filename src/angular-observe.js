var Angular = require('angular');

module.exports = 'filearts.angularObserve';

var mod = Angular.module(module.exports, []);

mod.directive('observe', ['$compile', '$q', '$rootScope', '$timeout', function ($compile, $q, $rootScope, $timeout) {
    return {
        restrict: 'EA',
        scope: true,
        compile: function (tElement) {
            var stateLinkFunctions = getStateLinkFunctions();
            
            tElement.empty();
            
            return link;
            
            function link($scope, $element, $attrs) {
                var childScope;
                var currentState;
                var isolateScope = $rootScope.$new(true, $scope);
                var source = $scope.$eval($attrs.observe || $attrs.source);
                
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
                        
                        $element.empty();
                        
                        if (childScope) {
                            childScope.$destroy();
                        }
                        
                        if (!linkFunction) {
                            return;
                        }
                        
                        childScope = isolateScope.$new();
                        currentState = state;
                        
                        var replacement = linkFunction(childScope);
                        
                        $element.append(replacement);
                    }
                    
                    if (!isolateScope.$root.$$phase) {
                        isolateScope.$digest(true);
                    }
                }
            }
            
            function getStateLinkFunctions() {
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
                        
                        stateLinkFunctions[state] = $compile(template);
                    }
                });
                
                if (!hasStateTemplates) {
                    if (!template.length) {
                        template.push(document.createTextNode('{{$value}}'));
                    }
                        
                    var linkFunction = $compile(template);
                    
                    stateLinkFunctions.active = linkFunction;
                    stateLinkFunctions.complete = linkFunction;
                }
                
                return stateLinkFunctions;
            }
        }
    };
}]);
