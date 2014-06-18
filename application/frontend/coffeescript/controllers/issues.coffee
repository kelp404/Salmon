angular.module 'salmon.controllers.issues', []

.controller 'IssuesController', ['$scope', '$injector', 'project', ($scope, $injector, project) ->
    $scope.allProjects.current = project
]

.controller 'NewIssueController', ['$scope', '$injector', 'project', ($scope, $injector, project) ->
    $scope.allProjects.current = project
    $scope.issue =
        title: ''
    $scope.submit = ($event) ->
        $event.preventDefault()
]

