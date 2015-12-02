var Angular = require('angular');

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
            
            $transclude(compileState.bind(null, 'active', false), null, '');
            $transclude(compileState.bind(null, 'loading', true), null, 'loading');
            $transclude(compileState.bind(null, 'active', true), null, 'active');
            $transclude(compileState.bind(null, 'complete', true), null, 'complete');
            $transclude(compileState.bind(null, 'error', true), null, 'error');
            
            if (!stateLinkFunctions.active) {
                console.warn('The `observable` directive requires at least one child element.');
                return;
            }
            
            // Subscribe to the observable
            var observable = typeof source.subscribe === 'function'
                ?   source
                :   typeof source.then === 'function'
                    ?   liftPromise(source)
                    :   liftValue(source);
            var subscription = observable.subscribe(onNext, onError, onComplete);
            
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
                    
                    $element.empty();
                    
                    if (!linkFunction) {
                        return;
                    }
                    
                    var replacement = linkFunction($scope);
                    
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