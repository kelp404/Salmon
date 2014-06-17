angular.module 'salmon.controllers.base', []

.controller 'BaseController', ['$scope', 'projects', ($scope, projects) ->
    $scope.allProjects = projects
    if $scope.allProjects.items
        $scope.allProjects.current = $scope.allProjects.items[0]
]
