angular.module('FormErrors', [])

// just put <form-errors><form-errors> wherever you want form errors 
// to be displayed! (well, not WHEREVER, it has to be in a form/ngForm)
.directive('formErrors', ['$parse', 'FormErrorsOptions', function ($parse, opts) {
    return {
        // only works if embedded in a form or an ngForm (that's in a form). 
        // It does use its closest parent that is a form OR ngForm
        template:
            '<ul class="form-errors">' +
                '<li class="form-error" ng-repeat="error in errors">' +
                    '{{ error }}' +
                '</li>' +
            '</ul>',
        replace: true,
        transclude: true,
        restrict: 'AE',
        require: '?^form',
        // isolated scope is required so we can embed ngForms and errors
        scope: { form: '=?', recurse: '=?showChildErrors' },
        link: function postLink(scope, elem, attrs, ctrl) {
            // if we don't provide
            if (scope.form) ctrl = scope.form;

            if (!ctrl) throw new Error('You must either specify a "form" attr or place formErrors directive inside a form/ngForm.');

            var getErrors = function () {
                scope.errors = crawlErrors(ctrl, scope.recurse);
            };

            // only update the list of errors if there was actually a change in $error
            scope.$watch(function () { return ctrl.$error; }, getErrors, true);
            // or if they changed the value to show child errors for some reason
            scope.$watch('recurse', getErrors);
        }
    };

    // humanize words, turning:
    //     camelCase  --> Camel Case
    //     dash-case  --> Dash Case
    //     snake_case --> Snake Case
    function humanize(str) {
        return str
                  // turn _ and - into spaces
                  .replace(/[-_+]/g, ' ')
                  // put a splace before every capital letter
                  .replace(/([A-Z])/g, ' $1')
                  // capitalize the first letter of each word
                  .replace(/^([a-z])|\s+([a-z])/g,
                        function ($1) { return $1.toUpperCase(); }
        );
    }

    function isController(obj) {
        // if it doesn't have a $modelValue, it's
        // an ngForm (as compared to an ngModel)
        return !obj.hasOwnProperty('$modelValue');
    }
    
    // this is where we form our message
    function errorMessage(name, error, props, recuse) {
        // get the nice name if they used the niceName 
        // directive or humanize the name and call it good
        var niceName = props.$niceName || humanize(name);

        // if it doesn't have a $modelValue, it's an ngForm
        if (isController(props)) {
            error = 'form';
        }

        // get a message from our default set
        var message = opts.defaultErrorMessages[error] || opts.defaultErrorMessages.fallback;

        // if they used the errorMessages directive, grab that message
        if (typeof props.$errorMessages === 'object') 
            message = props.$errorMessages[error];
        else if (typeof props.$errorMessages === 'string')
            message = props.$errorMessages;

        // return our nicely formatted message
        return niceName + ' ' + message;
    }

    function crawlErrors(ctrl, recurse, errors) {
        recurse = !!recurse;
        if (!angular.isArray(errors)) errors = [];

        angular.forEach(ctrl, function (props, name) {
            // name has some internal properties we don't want to iterate over
            if (name[0] === '$') return;

            // if show-child-errors was true, this we 
            // want to recurse through the child errors
            if (recurse && isController(props)) {
                crawlErrors(props, recurse, errors);
                // if we're recursing, we don't want to show ngForm errors 
                // (cuz we're showing their children ngModel errors instead)
                return;
            }

            angular.forEach(props.$error, function (isInvalid, error) {
                // don't need to even try and get a a message unless it's invalid
                if (isInvalid) {
                    errors.push(errorMessage(name, error, props, recurse));
                }
            });
        });

        return errors;
    }
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

// ngForm version of ngModel's niceName
.directive('formNiceName', [function () {
    return {
        require: 'form',
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$niceName = attrs.formNiceName;
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
            // defaultErrorMessages if you don't specify a specific error)
            try {
                ctrl.$errorMessages = scope.$eval(attrs.errorMessages);
            } catch (e) {
                ctrl.$errorMessages = attrs.errorMessages;
            }
        }
    };
}])

// give us a way to override some options
.provider('FormErrorsOptions', [function () {
    // list of some default error messages
    var options = {
        defaultErrorMessages: {
            required  : 'is required.',
            minlength : 'is too short.',
            maxlength : 'is too long.',
            email     : 'is not a valid email address.',
            pattern   : 'does not match the expected pattern.',
            number    : 'is not a number.',
            url       : 'is not a valid URL.',
            form      : 'has errors.',

            fallback  : 'is invalid.'
        }
    };

    this.extendDefaultErrorMessages = function (messages) {
        options.defaultErrorMessages = angular.extend(options.defaultErrorMessages, messages);
    };

    this.$get = function () {
        return options;
    };
}]);
