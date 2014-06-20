#Salmon

Salmon issue tracker.



##Development
>```bash
# Install node modules, bower components and pip packages.
$ npm install
$ bower install
$ pip install -r pip_requirements.txt
```
```bash
# compile frontend files
$ grunt dev
```

>```coffee
$rootScope =
    $state:
        # the $state of ui-router
    $stateParams:
        # the $stateParams of ui-router
    $confirmModal:
        # the confirm modal
        message: {string}
        callback: (result) ->
        isShow: {bool}
    $allProjects:   # from BaseController
        items: []
        current: {}
    $user:
        # the user object
```



##Test
>```bash
# frontend unit-test
$ grunt test
# python unit-test
$ python application/test.py
```
