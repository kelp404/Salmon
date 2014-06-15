angular.module 'v.controllers.index', []

.controller 'IndexController', ['$scope', '$injector', ($scope, $injector) ->
    $v = $injector.get '$v'
    $state = $injector.get '$state'

    if $v.user.isLogin
        $state.go 'v.settings-applications'
    else
        $stae.go 'v.login'
]
