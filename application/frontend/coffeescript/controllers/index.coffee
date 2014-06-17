angular.module 'salmon.controllers.index', []

.controller 'IndexController', ['$scope', '$injector', ($scope, $injector) ->
    $salmon = $injector.get '$salmon'
    $state = $injector.get '$state'

    if not $salmon.user.isLogin
        $state.go 'salmon.login'
    if $scope.allProjects.items.length
        $state.go 'salmon.projects-issues',
            projectId: $scope.allProjects.items[0].id
]
