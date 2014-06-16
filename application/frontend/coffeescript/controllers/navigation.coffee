angular.module 'salmon.controllers.navigation', []

.controller 'NavigationController', ['$scope', '$injector', ($scope, $injector) ->
    $salmon = $injector.get '$salmon'

    $scope.user = $salmon.user
    $scope.url = $salmon.url
    $scope.isRoot = $salmon.user.permission is 1
]
