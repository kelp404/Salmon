angular.module 'salmon.controllers.base', []

.controller 'BaseController', ['$scope', '$injector', 'projects', ($scope, $injector, projects) ->
    $rootScope = $injector.get '$rootScope'

    $rootScope.$projects = projects
    if $scope.$projects.items
        $scope.$projects.current = $scope.$projects.items[0]
]
