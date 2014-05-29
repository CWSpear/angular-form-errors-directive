# AngularJS Form Errors Directive ![Current Version](http://img.shields.io/github/tag/CWSpear/angular-form-errors-directive.svg?style=flat)

A set of directives to make it easier to display a list of form errors with an optional attribute to pass back form validity to your page's controller.

### Why?

Because it's a lot of work to do all those inline errors and to do markup for *every single* error that each input can violate. And maybe it doesn't fit in your design to do inline errors, etc, etc.

Why not just do everything (list *all* your form's errors, with messages) with **just a single element?**

## Installation

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

## Usage

For basic usage, all that's needed is to place a single element inside a `form` element:

```html
<form name="form" novalidate>
  <input type="text" name="name" required ng-model="name">
  ...
  <form-errors></form-errors>
</form>
```

**NOTE:** For this validation to work, you need a `name` attribute on your `form` element any form elements (i.e. `input`, `select`, etc) inside the form.

## Example

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

## The Finer Points

Where does it get the name that's invalid and how does it know what message to display? The name comes from the input's name attribute (attached in the form controller).

It does some automagic transformations to "humanize" it. For example, `firstName` gets turned into `First Name`.

For the error message, I have a few default error messages that correspond to keys that Angular sets. Here's the said list:

```javascript
defaultErrorMessages = {
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
```

### Custom Names and Messages

Let's say you have this `input`:

```html
<input type="url" name="website-url" ng-model="websiteUrl">
```

and let's say you want to say more than **Website Url is not a valid URL.** You can add a `nice-name` attribute to your `input` elements and it uses that name instead. i.e. `nice-name="Website URL"`

If you want a custom message, you can also add an `error-messages` attribute. You can either set just a string, and *all* errors will use that message, or you can use an object to set individual errors (and if one isn't found, it will fall back to a default error message).

So maybe this is our enhanced markup we use:

```html
<input type="url" name="website-url" ng-model="websiteUrl" 
    required nice-name="Website URL" 
    error-messages="{ url: 'is not a valid URL. Don\'t forget the http:// at the start' }">
```

If the field is empty, it will fallback to **Website URL is required.** If the URL is not valid, it will display **Website URL is not a valid URL. Don't forget the http:// at the start**

You can also pass the `error-messages` attribute a string and it will use that for every error. A nice shortcut when you don't need to specify every kind of different error.

### Embedded Forms

You can also use this to get the errors of an embedded `ngForm`. If you place an `formErrors` directive inside an `ngForm`, it will just display the errors for the `ngForm`. On the parent `form`, it won't display the specific errors of the `ngForm`, but *will* tell you that the child form has errors. You can change the child form's name similarly to the `nice-name` attribute on inputs, with `nice-name` attribute on the `ngForm`.

You can also set the `show-child-errors` attribute to a variable with a truthly value and instead of telling you if the child form has errors, it will just display all the errors from the child form. This will work recursively.

### Explicit Form

If you don't want to place a `formErrors` directive in a specific `form`/`ngForm` (or if you want to put it in a form but show errors to a different form), you can specify a specific `form` via an attribute:

```html
<form name="theForm">
  <!-- form goes here -->
</form>
<!-- still works outside of the <form> tag cuz we specify a specific form -->
<form-errors form="theForm"></form-errors>
```

Specifying a specific form via the `form` attribute overrides inheriting the form it's embedded in.

### Overriding and Extending the Default Error Messages

As of `v1.2.0`, you can override the default error messages via a provider at config:

```javascript
app.config(function (FormErrorsOptionsProvider) {
    FormErrorsOptionsProvider.extendDefaultErrorMessages({ 
        // It only overrides what you pass it. All 
        // other default messages will be left alone
        form: 'has some errors. Please fix them.'
    });
})
```

That way you don't have to pass each input an override if you use it globally. This is also a great place to add validation messages for custom/nonstandard error messages. For example, if I had a directive that checked if two fields matched, and if they didn't the `ngModelCtrl.$error.match` was set, you could pass in a default message here; something like `{ match: 'does not match.' }`.

#### Overriding/Extending Default Error Messages Per Directive

In `v1.4.0` and on, you can also override the default messages on a per-`formErrors` basis. This is done similar to how you can override each input's messages, but in this case, it *must* be an object and not a string. The `error-messages` directive on a specific input will override `error-messages` on a `formErrors` which will override the default set by the options provider:

```html
<form name="theForm">
  <!-- form goes here -->

  <!-- this will override the default error messages 
       for all the errors in this <form-errors>  -->
  <form-errors error-messages="{ required: 'needs to be non-blank.' }"></form-errors>
</form>
```

## Changelog

- **v1.4.1** Enforce object for `errorMessages` used on `formErrors` and deprecate formNiceName in favor of niceName, which will now work on both `ngModel` *and* `form`/`ngForm` elements (just learned that you can require multiple controllers).
- **v1.4.0** Add the ability to override the default errors used in a specific `formErrors` directive.
- **v1.3.0** Add the ability display all the child `ngForm` errors by setting a flag.
- **v1.2.0** Add the ability to extend/override the default error messages!
- **v1.1.0** Fix issue with embedded forms and add new options for using an explicit form and displaying error messages about embedded forms themselves.
- **v1.0.0** Clean up some code, make compatible with Angular 1.2.x

## Me

Follow me on Twitter: [@CWSpear](https://twitter.com/CWSpear) or check out my [blog](http://cameronspear.com/blog/).
