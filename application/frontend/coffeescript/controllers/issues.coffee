angular.module 'salmon.controllers.issues', []

.controller 'IssuesController', ['$scope', '$injector', 'issues', ($scope, $injector, issues) ->
    $validator = $injector.get '$validator'
    $salmon = $injector.get '$salmon'
    $timeout = $injector.get '$timeout'

    $scope.issues = issues
    for issue in $scope.issues.items
        issue.labels = do ->
            result = []
            for label in $scope.$projects.current.labels
                if label.id in issue.label_ids
                    result.push label
            result

    countIssues = ->
        if $scope.$stateParams.keyword
            $scope.$parent.count = null
        else
            $salmon.api.issue.countIssues $scope.$projects.current.id,
                status: $scope.$stateParams.status
                floor_lowest: $scope.$stateParams.floor_lowest
                floor_highest: $scope.$stateParams.floor_highest
                label_ids: $scope.$stateParams.label_ids?.split(',')
            .success (result) ->
                $scope.$parent.count = result
    countIssues()

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
        manageMode: no
        labels: []
        manageLabels: ->
            if @manageMode
                # submit change to server
                changedLabels = {}
                for x in @labels
                    changedLabels["#{x.id}"] = x.title
                newLabels = []
                for label in $scope.$projects.current.labels
                    if changedLabels["#{label.id}"]?
                        if label.title isnt changedLabels["#{label.id}"] and changedLabels["#{label.id}"]
                            label.title = changedLabels["#{label.id}"]
                            $salmon.api.label.updateLabel($scope.$projects.current.id, label)
                        newLabels.push label
                    else
                        $salmon.api.label.removeLabel($scope.$projects.current.id, label.id)
                $scope.$projects.current.labels = newLabels
            else
                @labels = angular.copy($scope.$projects.current.labels)
            @manageMode = !@manageMode

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
            $salmon.api.label.addLabel($scope.$projects.current.id, title: $scope.labelService.newLabel).success ->
                $salmon.api.label.getLabels($scope.$projects.current.id).success (result) ->
                    NProgress.done()
                    countIssues()
                    $scope.$projects.current.labels = result
                    $scope.labelService.newLabel = ''
                    $timeout -> $validator.reset $scope, 'labelService'
]

.controller 'EditIssueController', ['$scope', '$injector', 'issue', ($scope, $injector, issue) ->
    $validator = $injector.get '$validator'
    $salmon = $injector.get '$salmon'
    $state = $injector.get '$state'

    $scope.floorOptions = do ->
        for index in [$scope.$projects.current.floor_lowest..$scope.$projects.current.floor_highest] by 1 when index isnt 0
            label: if index < 0 then "B#{index * -1}" else "#{index}"
            value: index
    if issue?
        $scope.mode = 'edit'
        $scope.issue = issue
    else
        $scope.mode = 'new'
        $scope.issue =
            title: ''
            floor: $scope.floorOptions[0].value
            label_ids: []
    $scope.isActiveLabel = (labelId) -> labelId in $scope.issue.label_ids
    $scope.toggleLabel = (labelId, $event) ->
        $event.preventDefault()
        exist = no
        for index in [0..$scope.issue.label_ids.length] by 1
            if $scope.issue.label_ids[index] is labelId
                $scope.issue.label_ids.splice(index, 1)
                exist = yes
                break
        if not exist
            $scope.issue.label_ids.push labelId
    $scope.submit = ($event) ->
        $event.preventDefault()
        $validator.validate($scope, 'issue').success ->
            NProgress.start()
            if $scope.mode is 'new'
                $salmon.api.issue.addIssue($scope.$projects.current.id, $scope.issue).success ->
                    $state.go 'salmon.project.issues',
                        projectId: $scope.$projects.current.id
                        index: 0
            else # edit
                $salmon.api.issue.updateIssue($scope.$projects.current.id, $scope.issue).success ->
                    $state.go 'salmon.project.issue',
                        projectId: $scope.$projects.current.id
                        issueId: $scope.issue.id
]

.controller 'IssueController', ['$scope', '$injector', 'issue', ($scope, $injector, issue) ->
    $salmon = $injector.get '$salmon'

    $scope.issue = issue
    $scope.issue.labels = do ->
        result = []
        for label in $scope.$projects.current.labels
            if label.id in issue.label_ids
                result.push label
        result
    $scope.closeIssue = ->
        NProgress.start()
        $scope.issue.is_close = yes
        $salmon.api.issue.updateIssue($scope.$projects.current.id, $scope.issue).success ->
            NProgress.done()
]
