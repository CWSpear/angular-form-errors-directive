var app = angular.module('app', ['FormErrors']);

app.controller('MainCtrl', function ($scope) {
    $scope.showErrors = false;
    $scope.submit = function () {
        if ($scope.loginForm.$valid) {
            $scope.showErrors = false;
            $scope.message = 'Form is valid!';
        } else {
            $scope.showErrors = true;
            $scope.message = 'Please correct these errors:';
        }
    };
});