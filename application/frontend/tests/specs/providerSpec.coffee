describe 'salmon.provider', ->
    fakeModule = null
    salmonProvider = null

    beforeEach module('salmon')
    beforeEach ->
        # mock NProgress
        window.NProgress =
            start: ->
            done: ->
            configure: ->
        fakeModule = angular.module 'fakeModule', ['salmon']
        fakeModule.config ($salmonProvider) ->
            salmonProvider = $salmonProvider
    beforeEach module('fakeModule')

    describe '$salmon.user login', ->
        beforeEach ->
            window.user =
                id: 100
        it '$salmon.user.isLogin will be yes when $salmon.user.id is not null', inject ($salmon) ->
            expect($salmon.user.isLogin).toBeTruthy()
    describe '$salmon.user not login', ->
        beforeEach ->
            window.user = {}
        it '$salmon.user.isLogin will be no when $salmon.user.id is null', inject ($salmon) ->
            expect($salmon.user.isLogin).toBeFalsy()

    describe '$salmon.url', ->
        beforeEach ->
            window.url =
                login: 'login url'
        it '$salmon.url is window.url', inject ($salmon) ->
            expect($salmon.url).toBe window.url

    describe 'salmonProvider.http', ->
        it 'salmonProvider.http is $http', inject ($httpBackend) ->
            $httpBackend.whenGET('/views/shared/layout.html').respond '' # ui-router
            $httpBackend.whenGET('/views/login.html').respond '' # ui-router
            $httpBackend.whenGET('/views/index.html').respond '' # ui-router
            $httpBackend.whenGET('/').respond 'result'
            successSpy = jasmine.createSpy 'success'
            salmonProvider.http
                method: 'get'
                url: '/'
            .success (result) ->
                successSpy()
                expect(result).toEqual 'result'
            $httpBackend.flush()
            expect(successSpy).toHaveBeenCalled()

    describe '$salmon', ->
        it '$salmon.user and $salmonProvider.user are the same object', inject ($salmon) ->
            expect($salmon.user).toBe salmonProvider.user
        it '$salmon.url and $salmonProvider.url are the same object', inject ($salmon) ->
            expect($salmon.url).toBe salmonProvider.url
        it '$salmon.alert and $salmonProvider.alert are the same object', inject ($salmon) ->
            expect($salmon.alert).toBe salmonProvider.alert
        it '$salmon.api and $salmonProvider.api are the same object', inject ($salmon) ->
            expect($salmon.api).toBe salmonProvider.api
