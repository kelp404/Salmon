angular.module 'salmon.controllers.issues', []

.controller 'IssuesController', ['$scope', '$injector', 'project', 'issues', ($scope, $injector, project, issues) ->
    $scope.$allProjects.current = project
    $scope.issues = issues
    $scope.updateStatusFilter = (status) ->
        $scope.$stateParams.status = status
        $scope.$state.go 'salmon.project.issues', $scope.$stateParams
    $scope.showDetail = (projectId, issueId) ->
        $scope.$state.go 'salmon.project.issue',
            projectId: projectId
            issueId: issueId
]

.controller 'NewIssueController', ['$scope', '$injector', 'project', ($scope, $injector, project) ->
    $validator = $injector.get '$validator'
    $salmon = $injector.get '$salmon'
    $state = $injector.get '$state'

    $scope.$allProjects.current = project
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
            NProgress.start()
            $salmon.api.issue.addIssue(project.id, $scope.issue).success ->
                $state.go 'salmon.project.issues',
                    projectId: project.id
                    index: 0
                , reload: yes
]

.controller 'IssueController', ['$scope', '$injector', 'issue', ($scope, $injector, issue) ->
    $scope.issue = issue
]
