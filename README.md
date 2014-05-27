# AngularJS Form Errors Directive

A set of directives to make it easier to display a list of form errors with an optional attribute to pass back form validity to your page's controller.

#### Why?

Because it's a lot of work to do all those inline errors and to do markup for *every single* error that each input can violate. And maybe it doesn't fit in your design to do inline errors, etc, etc.

Why not just do everything (list *all* your form's errors, with messages) with **just a single element?**

### Installation

Install with [Bower](http://bower.io/):

```bash
bower install angular-form-errors-directive
```

Add the `formErrors.js` file to your HTML. For example:

```html
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.js"></script>
<script src="/path/to/formErrors.js"></script>
<script src="/path/to/your/app.js"></script>
```

Include the `FormErrors` module in your module:

```javascript
angular.module('app', ['FormErrors']);
```

### Usage

For basic usage, all that's needed is to place a single element inside a `form` element:

```html
<form name="form" novalidate>
  <input type="text" name="name" required ng-model="name">
  ...
  <form-errors></form-errors>
</form>
```

**NOTE:** For this validation to work, you need a `name` attribute on your `form` element any form elements (i.e. `input`, `select`, etc) inside the form.

### Example

HTML markup:

```html
<form ng-class="{ 'show-errors': showErrors }" name="loginForm" ng-submit="submit()" role="form" novalidate>
  <div class="form-group">
    <label for="inputUsername" class="control-label">Username (min 5 char)</label>
    <input type="text" name="username" class="form-control" id="inputUsername" placeholder="Username" ng-minlength="5" required ng-model="user.username">
  </div>
  
  <div class="form-group">
    <label for="inputPassword" class="control-label">Password (min 8 char)</label>
    <input type="password" name="password" class="form-control" id="inputPassword" placeholder="Password" ng-minlength="8" required ng-model="user.password">
  </div>
  
  <div class="form-group">
    <button type="submit" class="btn btn-primary">Sign in</button>
  </div>
  
  <p>{{ message }}</p>
  <form-errors class="list-unstyled"></form-errors>
</form>
```

JavaScript (just displays if the form is valid on valid submit):

```javascript
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
```

If the fields are empty (which are both required), then `<form-errors></form-errors>` would list the fields and their errors.

Demo: http://cwspear.github.io/angular-form-errors-directive

### The Finer Points

Where does it get the name that's invalid and how does it know what message to display? The name comes from the input's name attribute (attached in the form controller).

It does some automagic transformations to "humanize" it. For example, `firstName` gets turned into `First Name`.

For the error message, I have a few default error reasons that correspond to keys that Angular sets. Here's the said list:

```javascript
defaultErrorReasons = {
    required  : 'is required.',
    minlength : 'is too short.',
    maxlength : 'is too long.',
    email     : 'is not a valid email address.',
    pattern   : 'does not match the expected pattern.',
    number    : 'is not a number.',
    url       : 'is not a valid URL.',

    fallback  : 'is invalid.'
}
```

#### Custom Names and Messages

Let's say you have this `input`:

```html
<input type="url" name="website-url" ng-model="websiteUrl">
```

and let's say you want to say more than **Website Url is not a valid URL.** You can add a `nice-name` attribute to your `input` elements and it uses that name instead. i.e. `nice-name="Website URL"`

If you want a custom message, you can also add an `error-messages` attribute. You can either set just a string, and *all* errors will use that message, or you can use an object to set individual errors (and if one isn't found, it will fall back to a default error reason).

So maybe this is our enhanced markup we use:

```html
<input type="url" name="website-url" ng-model="websiteUrl" 
    required nice-name="Website URL" 
    error-messages="{ url: 'is not a valid URL. Don\'t forget the http:// at the start' }">
```

If the field is empty, it will fallback to **Website URL is required.** If the URL is not valid, it will display **Website URL is not a valid URL. Don't forget the http:// at the start**

You can also pass the `error-messages` attribute a string and it will use that for every error. A nice shortcut when you don't need to specify every kind of different error.
