angular.module 'salmon.controllers.issues', []

.controller 'IssuesController', ['$scope', '$injector', 'project', ($scope, $injector, project) ->
    $scope.allProjects.current = project
]

.controller 'NewIssueController', ['$scope', '$injector', 'project', ($scope, $injector, project) ->
    $validator = $injector.get '$validator'

    $scope.allProjects.current = project
    $scope.floorOptions = do ->
        for index in [project.floor_lowest..project.floor_highest] by 1 when index isnt 0
            label: if index < 0 then "B#{index * -1}" else "#{index}"
            value: index
    $scope.issue =
        title: ''
        floor: $scope.floorOptions[0].value
        room: project.room_options[0]
    $scope.submit = ($event) ->
        $event.preventDefault()
        $validator.validate($scope, 'issue').success ->
            console.log $scope.issue
]

