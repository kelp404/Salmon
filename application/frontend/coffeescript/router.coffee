angular.module 'salmon.router', [
    'salmon.provider'
    'salmon.controllers'
    'ui.router'
]

.config ['$stateProvider', '$urlRouterProvider', '$locationProvider', ($stateProvider, $urlRouterProvider, $locationProvider) ->

    # html5 mode
    $locationProvider.html5Mode yes

    # redirect other urls
    $urlRouterProvider.otherwise '/'

    # ---------------------------------------------------------
    #
    # ---------------------------------------------------------
    $stateProvider.state 'salmon',
        url: ''
        templateUrl: '/views/shared/layout.html'

    # ---------------------------------------------------------
    # /
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.index',
        url: '/'
        controller: 'IndexController'

    # ---------------------------------------------------------
    # /login
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.login',
        url: '/login'
        resolve:
            title: -> 'Login - '
        templateUrl: '/views/login.html'
        controller: 'LoginController'

    # ---------------------------------------------------------
    # /settings
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings',
        url: '/settings'
        resolve:
            title: -> 'Settings - '
        controller: 'SettingsController'

    # ---------------------------------------------------------
    # /settings/profile
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings-profile',
        url: '/settings/profile'
        resolve:
            title: -> 'Profile - Settings - '
            profile: ['$salmon', ($salmon) ->
                $salmon.api.settings.getProfile().then (response) ->
                    response.data
            ]
        templateUrl: '/views/settings/profile.html'
        controller: 'SettingsProfileController'

    # ---------------------------------------------------------
    # /settings/projects
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings-projects',
        url: '/settings/projects?index'
        resolve:
            title: -> 'Projects - Settings - '
            projects: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.project.getProjects($stateParams.index).then (response) ->
                    response.data
            ]
        templateUrl: '/views/settings/projects.html'
        controller: 'SettingsProjectsController'

    # ---------------------------------------------------------
    # /settings/users
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings-users',
        url: '/settings/users?index'
        resolve:
            title: -> 'Users - Settings - '
            users: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.user.getUsers($stateParams.index).then (response) ->
                    response.data
            ]
        templateUrl: '/views/settings/users.html'
        controller: 'SettingsUsersController'
    # ---------------------------------------------------------
    # /settings/users/new
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings-users.new',
        url: '/new'
        resolve:
            title: -> 'Users - Settings - '
        templateUrl: '/views/modal/user.html'
        controller: 'SettingsNewUserController'
    # ---------------------------------------------------------
    # /settings/users/{userId}
    # ---------------------------------------------------------
    $stateProvider.state 'salmon.settings-users.detail',
        url: '/:userId'
        resolve:
            title: -> 'Users - Settings - '
            user: ['$salmon', '$stateParams', ($salmon, $stateParams) ->
                $salmon.api.user.getUser($stateParams.userId).then (response) ->
                    response.data
            ]
        templateUrl: '/views/modal/user.html'
        controller: 'SettingsUserController'
]

.run ['$injector', ($injector) ->
    $rootScope = $injector.get '$rootScope'
    $stateParams = $injector.get '$stateParams'
    $state = $injector.get '$state'
    $salmon = $injector.get '$salmon'

    $rootScope.$stateParams = $stateParams
    $rootScope.$state = $state

    # ui.router state change event
    changeStartEvent = null
    fromStateName = null
    toStateName = null
    $rootScope.$on '$stateChangeStart', (event, toState, toParams, fromState) ->
        changeStartEvent = window.event
        fromStateName = fromState.name
        toStateName = toState.name
        NProgress.start()
    $rootScope.$on '$stateChangeSuccess', (event, toState) ->
        NProgress.done()
        if not $salmon.user.isLogin and toState.name isnt 'salmon.login'
            $state.go 'salmon.login'
    $rootScope.$on '$stateChangeError', (event, toState) ->
        NProgress.done()
        if not $salmon.user.isLogin and toState.name isnt 'salmon.login'
            $state.go 'salmon.login'
    $rootScope.$on '$viewContentLoaded', ->
        return if changeStartEvent?.type is 'popstate'
        if fromStateName? and toStateName?
            return if fromStateName.replace(toStateName, '').indexOf('.') is 0
            return if toStateName.replace(fromStateName, '').indexOf('.') is 0
        window.scrollTo 0, 0
]
