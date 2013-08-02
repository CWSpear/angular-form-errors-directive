# AngularJS Form Errors Directive

A set of directives to make it easier to display a list of form errors with an 
optional attribute to pass back form validity to your page's controller.

**NOTE:** For this validation to work, you need a `name` attribute on your 
`form` element any form (i.e. `input`, `select`, etc) elements inside the form.

###Usage

For basic usage, all that's needed is to place a single element inside a 
`form` element:

```javascript
<form name="form">
    ...
    <form-errors></form-errors>
</form>
```

###Options

You can add an (optional) attribute, `is-valid`, and the directive will set it
to set that variable to be `true`/`false` depending on if the form is valid or
not.

###Examples

HTML markup:

```html
<form name="loginForm" ng-submit="submit()" class="form-horizontal">
  <div class="form-group">
    <label for="inputEmail" class="col-lg-2 control-label">Email</label>
    <div class="col-lg-10">
      <input type="email" name="email" class="form-control" id="inputEmail" placeholder="Email" required ng-model="user.username">
    </div>
  </div>
  <div class="form-group">
    <label for="inputPassword" class="col-lg-2 control-label">Password</label>
    <div class="col-lg-10">
      <input type="password" name="password" class="form-control" id="inputPassword" placeholder="Password" ng-minlength="8" required ng-model="user.password">

      <form-errors is-valid="form.isValid"></form-errors>

      <button type="submit" class="btn btn-default">Sign in</button>
    </div>
  </div>
</form>
```

JavaScript (just logs if the form is valid on submit):

```javascript
var app = angular.module('plunker', ['FormErrors']);

app.controller('MainCtrl', function($scope) {
  $scope.form = { isValid: true };
  $scope.submit = function() {
    console.log($scope.form.isValid);
  };
});
```

If the fields are empty (which are both required), then 
`<form-errors></form-errors>`

Demo: http://plnkr.co/edit/h9zRAMTSzhhmFmWu052v?p=preview

###The Finer Points

Where does it get the name that's invalid and how does it know what message to 
display? The name comes from the input's name attribute (attached in the form
controller).

It doesn't some transformations to "humanize" it. For example, `firstName` gets
turned into `First Name`.

For the error message, I have a few default error reasons that correspond to
keys that Angular sets. Here's the said list:

```javascript
defaultErrorReasons = {
    required: 'is required.',
    minlength: 'is too short.',
    maxlength: 'is too long.',
    email: 'is not a valid email address.',
    pattern: 'does not match the expected pattern.',
    number: 'is not a number.',
    url: 'is not a valid URL.'

    fallback: 'is invalid.'
}
```

####Custom Names and Messages

Let's say you have this `input`:

```html
<input type="url" name="website-url" ng-model="websiteUrl">
```

and let's say you want to say more than **Website Url is not a valid URL.** 
You can add a `nice-name` attribute to your `input` elements and it uses that 
name instead. i.e. `nice-name="Website URL"`

If you want a custom message, you can also add an `error-messages` attribute. 
You can either set just a string, and *all* errors will use that message, or 
you can use an object to set individual errors (and if one isn't found, it 
will fall back to a default error reason).

So maybe this is our enhanced markup we use:

```html
<input type="url" name="website-url" ng-model="websiteUrl" 
    required nice-name="Website URL" 
    error-messages="{ url: 'is not a valid URL. Don't forget the http://' }">
```

If the field is empty, it will fallback to **Website URL is required.** If the URL
is not valid, it will display **Website URL is not a valid URL. Don't forget the
http://**
