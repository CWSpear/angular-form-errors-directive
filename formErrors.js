angular.module('FormErrors', [])

// just put <form-errors><form-errors> wherever you want form errors to be displayed!
.directive('formErrors', [function () {
    return {
        // only works if embedded in a form or an ngForm (that's in a form). 
        // It does use its closest parent that is a form OR ngForm
        require: '^form',
        template:
            '<ul class="form-errors" ng-transclude>' +
                '<li class="form-error" ng-repeat="error in errors">' +
                    '{{error}}' +
                '</li>' +
            '</ul>',
        replace: true,
        transclude: true,
        restrict: 'AE',
        link: function postLink(scope, elem, attrs, ctrl) {
            // list of some default error reasons
            var defaultErrorReasons = {
                    required: 'is required.',
                    minlength: 'is too short.',
                    maxlength: 'is too long.',
                    email: 'is not a valid email address.',
                    pattern: 'does not match the expected pattern.',
                    number: 'is not a number.',

                    fallback: 'is invalid.'
                },
                // humanize words, turning:
                //     camelCase  --> Camel Case
                //     dash-case  --> Dash Case
                //     snake_case --> Snake Case
                humanize = function (str) {
                    return str.replace(/[-_+]/g, ' ') // turn _ and - into spaces
                              .replace(/([A-Z])/g, ' $1') // put a splace before every capital letter
                              .replace(/^([a-z])|\s+([a-z])/g, // capitalize the first letter of each word
                                    function ($1) { return $1.toUpperCase(); }
                    );
                },
                // this is where we form our message
                errorMessage = function (name, error, props) {
                    // get the nice name if they used the niceName 
                    // directive or humanize the name and call it good
                    var niceName = props.$niceName || humanize(name);

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

            // only update the list of errors if there was actually a change in $error
            scope.$watch(function() { return ctrl.$error; }, function() {
                // reset error array
                scope.errors = [];
                angular.forEach(ctrl, function(props, name) {
                    // name has some internal properties we don't want to iterate over
                    if(name[0] === '$') return;
                    angular.forEach(props.$error, function(isInvalid, error) {
                        // don't need to even try and get a a message unless it's invalid
                        if(isInvalid) {
                            scope.errors.push(errorMessage(name, error, props));
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