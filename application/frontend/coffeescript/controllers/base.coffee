angular.module 'salmon.controllers.base', []

.controller 'BaseController', ['$scope', '$injector', 'projects', ($scope, $injector, projects) ->
    $rootScope = $injector.get '$rootScope'

    $rootScope.$allProjects = projects
    if $scope.$allProjects.items
        $scope.$allProjects.current = $scope.$allProjects.items[0]
]
