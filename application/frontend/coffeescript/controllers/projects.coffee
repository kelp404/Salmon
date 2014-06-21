angular.module 'salmon.controllers.projects', []

.controller 'ProjectController', ['$scope', ($scope) ->
    if $scope.$state.current.name is 'salmon.project'
        $scope.$state.go 'salmon.project.issues'
]
