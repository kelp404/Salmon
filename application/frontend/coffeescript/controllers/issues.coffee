angular.module 'salmon.controllers.issues', []

.controller 'IssuesController', ['$scope', '$injector', 'issues', ($scope, $injector, issues) ->
    $validator = $injector.get '$validator'
    $salmon = $injector.get '$salmon'
    $timeout = $injector.get '$timeout'

    $scope.issues = issues
    $scope.updateStatusFilter = (status) ->
        $scope.$stateParams.status = status
        $scope.$state.go $scope.$state.current, $scope.$stateParams
    $scope.showDetail = (projectId, issueId) ->
        $scope.$state.go 'salmon.project.issue',
            projectId: projectId
            issueId: issueId
    $scope.floorOptions =
        lowest: $scope.$stateParams.floor_lowest
        highest: $scope.$stateParams.floor_highest
    $scope.$watch 'floorOptions', (newValue, oldValue) ->
        return if newValue is oldValue
        $scope.$stateParams.floor_lowest = $scope.floorOptions.lowest
        $scope.$stateParams.floor_highest = $scope.floorOptions.highest
        $scope.$state.go $scope.$state.current, $scope.$stateParams
    , yes

    $scope.labelService =
        newLabel: ''
        isActive: (labelId) ->
            labelId = "#{labelId}"
            if not $scope.$stateParams.label_ids?
                no
            else if typeof($scope.$stateParams.label_ids) is 'string'
                $scope.$stateParams.label_ids?.indexOf(labelId) >= 0
            else
                labelId in $scope.$stateParams.label_ids
        updateLabelFilter: (labelId, $event) ->
            $event.preventDefault()
            labelId = "#{labelId}"
            $scope.$stateParams.label_ids ?= []
            if typeof($scope.$stateParams.label_ids) is 'string'
                $scope.$stateParams.label_ids = $scope.$stateParams.label_ids.split(',')
            exist = no
            for index in [0..$scope.$stateParams.label_ids.length] by 1
                if $scope.$stateParams.label_ids[index] is labelId
                    $scope.$stateParams.label_ids.splice(index, 1)
                    exist = yes
                    break
            if not exist
                $scope.$stateParams.label_ids.push labelId
            $scope.$state.go $scope.$state.current, $scope.$stateParams
        addLabel: -> $validator.validate($scope, 'labelService').success ->
            NProgress.start()
            $salmon.api.label.addLabel($scope.$allProjects.current.id, title: $scope.labelService.newLabel).success ->
                $salmon.api.label.getLabels($scope.$allProjects.current.id).success (result) ->
                    NProgress.done()
                    $scope.$allProjects.current.labels = result
                    $scope.labelService.newLabel = ''
                    $timeout -> $validator.reset $scope, 'labelService'
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
