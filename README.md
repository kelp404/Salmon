#Salmon [![circle-ci](https://circleci.com/gh/kelp404/Salmon/tree/master.png?circle-token=21752831e8ea62092d9f0e713154cab11086daf7)](https://circleci.com/gh/kelp404/Salmon/tree/master)

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
    $projects:   # from BaseController
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
