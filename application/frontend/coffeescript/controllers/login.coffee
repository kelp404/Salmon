angular.module 'salmon.controllers.login', []

.controller 'LoginController', ['$scope', '$injector', ($scope, $injector) ->
    $salmon = $injector.get '$salmon'
    $scope.url = $salmon.url
]
