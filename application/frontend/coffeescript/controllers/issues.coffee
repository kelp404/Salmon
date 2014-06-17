angular.module 'salmon.controllers.issues', []

.controller 'IssuesController', ['$scope', '$injector', 'project', ($scope, $injector, project) ->
    $scope.allProjects.current = project
]

