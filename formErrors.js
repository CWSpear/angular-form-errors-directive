angular.module('FormErrors', [])

// just put <form-errors><form-errors> wherever you want form errors to be displayed!
.directive('formErrors', [function () {
    return {
        // only works if embedded in a form or an ngForm (that's in a form). 
        // It does use its closest parent that is a form OR ngForm
        require: '^form',
        template:
            '<div class="form-errors" ng-transclude>' +
                '<div class="form-error" ng-repeat="error in errors">' +
                    '{{error}}' +
                '</div>' +
            '</div>',
        replace: true,
        transclude: true,
        restrict: 'AE',
        scope: { isValid: '=' },
        link: function postLink(scope, elem, attrs, ctrl) {
            // list of some default error reasons
            var defaultErrorReasons = {
                    required: 'is required.',
                    minlength: 'is too short.',
                    maxlength: 'is too long.',
                    email: 'is not a valid email address.',
                    pattern: 'does not expect the matched pattern.',

                    fallback: 'is invalid.'
                },
                // uppercase words helper
                ucwords = function(text) {
                    return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
                        return $1.toUpperCase();
                    });
                },
                // breakup camelCase
                breakup = function(text, separator) {
                    return text.replace(/[A-Z]/g, function (match) {
                        return separator + match;
                    });
                },
                // humanize words
                humanize = function (value) {
                    return ucwords(breakup(value, ' ').replace(/[-_+]/g, ' '));
                },
                // this is where we form our message
                formMessage = function formMessage(elem, error, props) {
                    // get the nice name if used the niceName directive 
                    // or humanize the elem name and call it good
                    var niceName = props.$niceName || humanize(elem);

                    // get a reason from our default set
                    var reason = defaultErrorReasons[error] || defaultErrorReasons.fallback;

                    // if they used the errorMessages directive, grab that message
                    if(typeof props.$errorMessages === 'object') 
                        reason = props.$errorMessages[error];
                    else if(typeof props.$errorMessages === 'string')
                        reason = props.$errorMessages;

                    // return our nicely formatted message
                    return niceName + ' ' + reason;
                };

            // only update the list of errors if there was actually a change
            scope.$watch(function() { return ctrl.$error; }, function() {
                // we can pass in a variable to keep track of form validity in page's ctrl
                scope.isValid = ctrl.$valid;
                scope.errors = [];
                angular.forEach(ctrl, function(props, elem) {
                    // elem has some internal properties we don't want to iterate over
                    if(elem[0] === '$') return;
                    angular.forEach(props.$error, function(isInvalid, error) {
                        // don't need to even try and get a a message unless it's invalid
                        if(isInvalid) {
                            scope.errors.push(formMessage(elem, error, props));
                        }
                    });
                });
            }, true);
        }
    };
}])

// set a nice name to $niceName on the ngModel ctrl for later use
.directive('niceName', [function () {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            ctrl.$niceName = attrs.niceName;
        }
    };
}])

// set an errorMessage(s) to $errorMessages on the ngModel ctrl for later use
.directive('errorMessages', [function () {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            // attrs.errorMessages can be:
            //    1) "must be filled out."
            //    2) "'must be filled out.'"
            //    3) "{ required: 'must be filled out.' }"
            try {
                ctrl.$errorMessages = scope.$eval(attrs.errorMessages);
            } catch(e) {
                ctrl.$errorMessages = attrs.errorMessages;
            }
        }
    };
}]);