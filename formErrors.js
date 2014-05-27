angular.module('FormErrors', [])

// just put <form-errors><form-errors> wherever you want form errors 
// to be displayed! (well, not WHEREVER, it has to be in a form/ngForm)
.directive('formErrors', [function () {
    return {
        // only works if embedded in a form or an ngForm (that's in a form). 
        // It does use its closest parent that is a form OR ngForm
        require: '^form',
        template:
            '<ul class="form-errors">' +
                '<li class="form-error" ng-repeat="error in errors">' +
                    '{{ error }}' +
                '</li>' +
            '</ul>',
        replace: true,
        transclude: true,
        restrict: 'AE',
        link: function postLink(scope, elem, attrs, ctrl) {
            // list of some default error reasons
            var defaultErrorReasons = {
                    required  : 'is required.',
                    minlength : 'is too short.',
                    maxlength : 'is too long.',
                    email     : 'is not a valid email address.',
                    pattern   : 'does not match the expected pattern.',
                    number    : 'is not a number.',
                    url       : 'is not a valid URL.',

                    fallback  : 'is invalid.'
                },
                // humanize words, turning:
                //     camelCase  --> Camel Case
                //     dash-case  --> Dash Case
                //     snake_case --> Snake Case
                humanize = function (str) {
                    return str
                              // turn _ and - into spaces
                              .replace(/[-_+]/g, ' ')
                              // put a splace before every capital letter
                              .replace(/([A-Z])/g, ' $1')
                              // capitalize the first letter of each word
                              .replace(/^([a-z])|\s+([a-z])/g,
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
                    if (typeof props.$errorMessages === 'object') 
                        reason = props.$errorMessages[error];
                    else if (typeof props.$errorMessages === 'string')
                        reason = props.$errorMessages;

                    // return our nicely formatted message
                    return niceName + ' ' + reason;
                };

            // only update the list of errors if there was actually a change in $error
            scope.$watch(function () { return ctrl.$error; }, function () {
                var errors = [];
                angular.forEach(ctrl, function (props, name) {
                    // name has some internal properties we don't want to iterate over
                    if (name[0] === '$') return;
                    angular.forEach(props.$error, function (isInvalid, error) {
                        // don't need to even try and get a a message unless it's invalid
                        if (isInvalid) {
                            errors.push(errorMessage(name, error, props));
                        }
                    });
                });
                scope.errors = errors;
            }, true);
        }
    };
}])

// set a nice name to $niceName on the ngModel ctrl for later use
.directive('niceName', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$niceName = attrs.niceName;
        }
    };
}])

// set an errorMessage(s) to $errorMessages on the ngModel ctrl for later use
.directive('errorMessages', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            // attrs.errorMessages can be:
            //    1) "must be filled out."
            //    2) "'must be filled out.'"
            //    3) "{ required: 'must be filled out.' }"
            // 1 & 2) will be the message for any kind of error
            // 3) allows you to specify each error (it will use the
            // defaultErrorReasons if you don't specify a specific error)
            try {
                ctrl.$errorMessages = scope.$eval(attrs.errorMessages);
            } catch (e) {
                ctrl.$errorMessages = attrs.errorMessages;
            }
        }
    };
}]);