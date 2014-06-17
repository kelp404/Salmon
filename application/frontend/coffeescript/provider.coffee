angular.module 'salmon.provider', []

.provider '$salmon', ->
    $injector = null
    $http = null
    $rootScope = null

    # -----------------------------------------------------
    # private methods
    # -----------------------------------------------------
    @setupProviders = (injector) ->
        $injector = injector
        $http = $injector.get '$http'
        $rootScope = $injector.get '$rootScope'
        $rootScope.$confirmModal = {}


    # -----------------------------------------------------
    # public methods
    # -----------------------------------------------------
    @user = window.user ? {}
    @user.isLogin = @user.id?
    @user.isRoot = @user.permission is 1
    @url = window.url

    @alert =
        saved: (message='Saved successful.') ->
            ###
            Pop the message to tell user the data hade been saved.
            ###
            $.av.pop
                title: 'Success'
                message: message
                expire: 3000
        confirm: (message, callback) ->
            $rootScope.$confirmModal.message = message
            $rootScope.$confirmModal.callback = callback
            $rootScope.$confirmModal.isShow = yes

    @http = (args) =>
        $http args
        .error ->
            $.av.pop
                title: 'Server Error'
                message: 'Please try again or refresh this page.'
                template: 'error'
                expire: 3000
            NProgress.done()

    @api =
        settings:
            getProfile: =>
                @http
                    method: 'get'
                    url: '/settings/profile'
            updateProfile: (profile) =>
                ###
                @param profile:
                    name: {string}
                ###
                @http
                    method: 'put'
                    url: '/settings/profile'
                    data: profile
        project:
            getProjects: (index=0) =>
                @http
                    method: 'get'
                    url: '/settings/projects'
                    params:
                        index: index
            getProject: (projectId) =>
                @http
                    method: 'get'
                    url: "/settings/projects/#{projectId}"
            addProject: (project) =>
                @http
                    method: 'post'
                    url: "/settings/projects"
                    data: project
            removeProject: (projectId) =>
                @http
                    method: 'delete'
                    url: "/settings/projects/#{projectId}"
            updateProject: (project) =>
                @http
                    method: 'put'
                    url: "/settings/projects/#{project.id}"
                    data: project
            addProjectMember: (projectId, email) =>
                @http
                    method: 'post'
                    url: "/settings/projects/#{projectId}/members"
                    data:
                        email: email
        user:
            getUsers: (index=0, keyword) =>
                @http
                    method: 'get'
                    url: '/settings/users'
                    params:
                        index: index
                        keyword: keyword
            getUser: (userId) =>
                @http
                    method: 'get'
                    url: "/settings/users/#{userId}"
            inviteUser: (email) =>
                @http
                    method: 'post'
                    url: '/settings/users'
                    data:
                        email: email
            removeUser: (userId) =>
                @http
                    method: 'delete'
                    url: "/settings/users/#{userId}"
            updateUser: (user) =>
                @http
                    method: 'put'
                    url: "/settings/users/#{user.id}"
                    data: user

    # -----------------------------------------------------
    # $get
    # -----------------------------------------------------
    @$get = ['$injector', ($injector) =>
        @setupProviders $injector

        user: @user
        url: @url
        alert: @alert
        api: @api
    ]
    return
