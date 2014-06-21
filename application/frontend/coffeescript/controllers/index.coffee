angular.module 'salmon.controllers.index', []

.controller 'IndexController', ['$scope', '$injector', ($scope, $injector) ->
    $salmon = $injector.get '$salmon'
    $state = $injector.get '$state'

    if not $salmon.user.isLogin
        $state.go 'salmon.login'
    if $scope.$projects.items.length
        $state.go 'salmon.project',
            projectId: $scope.$projects.items[0].id
]
