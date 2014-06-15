angular.module 'salmon.controllers.index', []

.controller 'IndexController', ['$scope', '$injector', ($scope, $injector) ->
    $v = $injector.get '$v'
    $state = $injector.get '$state'

    if $v.user.isLogin
        $state.go 'v.settings-profile'
    else
        $stae.go 'v.login'
]
