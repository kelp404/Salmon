angular.module 'salmon.controllers.navigation', []

.controller 'NavigationController', ['$scope', '$injector', ($scope, $injector) ->
    $salmon = $injector.get '$salmon'

    $scope.url = $salmon.url
]
