var Angular = require('angular');

module.exports = 'filearts.angularObserve';

var mod = Angular.module(module.exports, []);

mod.directive('observe', ['$compile', function ($compile) {
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
            // Subscribe to the observable
            var stateLinkFunctions = {};
            var currentState;
            var observable = $scope.$eval($attrs.observe || $attrs.source);
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
            
            function setState(state, skipDigest) {
                if (state !== currentState) {
                    $element.empty();
                    
                    var linkFunction = stateLinkFunctions[state];
                    
                    if (!linkFunction) {
                        return;
                    }
                    
                    var replacement = linkFunction($scope);
                    
                    $element.append(replacement);
                    
                    currentState = state;
                }
                
                if (!skipDigest) {
                    $scope.$digest(true);
                }
            }
        }
    };
}]);