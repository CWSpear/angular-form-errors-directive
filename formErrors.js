angular.module('FormErrors', [])

// just put <form-errors><form-errors> wherever you want form errors
// to be displayed! (well, not WHEREVER, it has to be in a form/ngForm)
.directive('formErrors', ['FormErrorsOptions', function (opts) {
    return {
        // only works if embedded in a form or an ngForm (that's in a form).
        // It does use its closest parent that is a form OR ngForm
        template: function (elem) {
            if (!angular.isUndefined(elem.attr('errors-tmpl'))) {
                return '<div ng-include src="\'' + elem.attr('errors-tmpl') + '\'"></div>';
            }
            return '' +
                '<ul class="form-errors">' +
                    '<li class="form-error" ng-repeat="error in errors track by $index">' +
                        '{{ error.message }}' +
                    '</li>' +
                '</ul>';
        },
        replace: true,
        // this directive needs a higher priority than errorMessages directive
        priority: 1,
        restrict: 'AE',
        require: ['?^form', 'formErrors'],
        // isolated scope is required so we can embed ngForms and errors
        scope: { form: '=?', recurse: '=?showChildErrors' },
        // the controller doesn't need to do anything here, it just 
        // needs to exist so that other directives can do stuff with it
        controller: [function () {}],
        link: function postLink(scope, elem, attrs, ctrls) {
            var ngModelCtrl = ctrls[0];
            var formErrorsCtrl = ctrls[1];

            // if we don't provide
            if (scope.form) ngModelCtrl = scope.form;

            if (!ngModelCtrl) throw new Error('You must either specify a "form" attr or place formErrors directive inside a form/ngForm.');

            var thisCrawlErrors = angular.bind(formErrorsCtrl, crawlErrors);
            var getErrors = function () {
                scope.errors = thisCrawlErrors(ngModelCtrl, scope.recurse);
            };

            // only update the list of errors if there was actually a change in $error
            scope.$watch(function () { return ngModelCtrl.$error; }, getErrors, true);
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
    function errorMessage(name, error, props, defaultErrorMessages) {
        // get the nice name if they used the niceName
        // directive or humanize the name and call it good
        var niceName = props.$niceName || humanize(name);

        // if it doesn't have a $modelValue, it's an ngForm
        if (isController(props)) {
            error = 'form';
        }

        // get a message from our default set
        var message = defaultErrorMessages[error] || defaultErrorMessages.fallback;

        // if they used the errorMessages directive, grab that message
        if (typeof props.$errorMessages === 'object')
            message = props.$errorMessages[error];
        else if (typeof props.$errorMessages === 'string')
            message = props.$errorMessages;

        // return our nicely formatted message
        return niceName + ' ' + message;
    }

    function crawlErrors(ctrl, recurse, errors) {
        // "this" will be this directive's controller
        var errorMessages = angular.extend(opts.defaultErrorMessages, this.$errorMessages);

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
                    errors.push( new Error (errorMessage(name, error, props, errorMessages)));
                }
            });
        });

        return errors;
    }
}])

// set a nice name to $niceName on the ngModel ctrl for later use
.directive('niceName', [function () {
    return {
        require: ['?ngModel', '?form'],
        link: function (scope, elem, attrs, ctrls) {
            var ctrl = ctrls[0] || ctrls[1];

            if (ctrl) ctrl.$niceName = attrs.niceName;
        }
    };
}])

// ngForm version of ngModel's niceName
.directive('formNiceName', [function () {
    return {
        require: 'form',
        link: function (scope, elem, attrs, ctrl) {
            console.warn('formNiceName is deprecated. Please use niceName instead.');
            ctrl.$niceName = attrs.formNiceName;
        }
    };
}])

// set an errorMessage(s) to $errorMessages on the formError or ngModel ctrl for later use
.directive('errorMessages', [function () {
    return {
        require: ['?ngModel', '?formErrors'],
        link: function errorMessagesLink(scope, elem, attrs, ctrls) {

            var ctrl = ctrls[0] || ctrls[1];

            if (!ctrl) throw new Error('You attach errorMessages to either an ngModel or formErrors.');

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

            if (ctrls[1] && ctrl.$errorMessages) {
                if (!angular.isObject(ctrl.$errorMessages) || angular.isArray(ctrl.$errorMessages)) {
                    ctrl.$errorMessages = undefined;
                    throw new Error('errorMessages defined on a formErrors must be an object.');
                }
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
