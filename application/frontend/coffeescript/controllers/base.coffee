angular.module 'salmon.controllers.base', []

.controller 'BaseController', ['$scope', 'projects', ($scope, projects) ->
    $scope.allProjects = projects
]
