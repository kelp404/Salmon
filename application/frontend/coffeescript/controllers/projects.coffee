angular.module 'salmon.controllers.projects', []

.controller 'ProjectController', ['$scope', 'project', ($scope, project) ->
    $scope.$projects.current = project
    $scope.$projects.current.isRoot = $scope.$user.id in project.root_ids
    $scope.$projects.current.floor_options = do ->
        for index in [project.floor_lowest..project.floor_highest] by 1 when index isnt 0
            value: "#{index}"
            label: if index < 0 then "B#{index * -1}" else index

    if $scope.$state.current.name is 'salmon.project'
        $scope.$state.go 'salmon.project.issues'
]
