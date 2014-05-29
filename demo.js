var app = angular.module('app', ['FormErrors']);

app.config(function (FormErrorsOptionsProvider) {
    FormErrorsOptionsProvider.extendDefaultErrorMessages({ 
        // It only overrides what you pass it. All 
        // other default messages will be left alone
        form: 'has some errors. Please fix them.'
    });
})

app.controller('MainCtrl', function ($scope) {
    $scope.showErrors = false;
    $scope.submit = function () {
        if ($scope.loginForm.$valid) {
            $scope.showErrors = false;
            $scope.message = 'Form is valid!';
        } else {
            $scope.showErrors = true;
            $scope.message = 'Please correct the above errors.';
        }
    };
});