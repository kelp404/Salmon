angular.module 'salmon.validations', [
    'validator'
]

.config ['$validatorProvider', ($validatorProvider) ->
    # ----------------------------------------
    # required
    # ----------------------------------------
    $validatorProvider.register 'required',
        validator: /.+/
        error: _ 'This field is required.'

    # ----------------------------------------
    # email
    # ----------------------------------------
    $validatorProvider.register 'email',
        validator: /(^$)|(^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/
        error: _ 'This field should be the email.'
]
