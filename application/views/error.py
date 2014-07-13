# -*- coding: utf-8 -*-
from django.conf import settings
from django.template import loader, RequestContext, Context
from django import http
from application.victorique import Victorique
from application.models.dto.error_model import ErrorModel


def bad_request(request, e=None):
    v = Victorique(getattr(settings, 'VICTORIQUE_URL'), str(request.user))
    document = {
        'method': request.method,
        'path': request.get_host() + request.get_full_path(),
        'message': e.message if e and e.message else None,
        'stack': e.stack if e else None,
    }
    v.send('bad request at %s %s' % (document['method'], document['path']), document)

    template = loader.get_template('error/default.html')
    model = ErrorModel(
        status=400,
        exception='Bad Request'
    )
    return http.HttpResponseBadRequest(template.render(RequestContext(request, model)))

def permission_denied(request, e=None):
    v = Victorique(getattr(settings, 'VICTORIQUE_URL'), str(request.user))
    document = {
        'method': request.method,
        'path': request.get_host() + request.get_full_path(),
        'message': e.message if e and e.message else None,
        'stack': e.stack if e else None,
    }
    v.send('permission denied at %s %s' % (document['method'], document['path']), document)

    template = loader.get_template('error/default.html')
    model = ErrorModel(
        status=403,
        exception='Permission Denied'
    )
    return http.HttpResponseForbidden(template.render(RequestContext(request, model)))

def page_not_found(request, e=None):
    v = Victorique(getattr(settings, 'VICTORIQUE_URL'), str(request.user))
    document = {
        'method': request.method,
        'path': request.get_host() + request.get_full_path(),
        'message': e.message if e and e.message else None,
        'stack': e.stack if e else None,
    }
    v.send('not found at %s %s' % (document['method'], document['path']), document)

    template = loader.get_template('error/default.html')
    model = ErrorModel(
        status=404,
        exception='%s Not Found' % request.path
    )
    return http.HttpResponseNotFound(template.render(RequestContext(request, model)))

def method_not_allowed(request, e=None):
    v = Victorique(getattr(settings, 'VICTORIQUE_URL'), str(request.user))
    document = {
        'method': request.method,
        'path': request.get_host() + request.get_full_path(),
        'message': e.message if e and e.message else None,
        'stack': e.stack if e else None,
    }
    v.send('method not allowed at %s %s' % (document['method'], document['path']), document)

    template = loader.get_template('error/default.html')
    model = ErrorModel(
        status=405,
        exception='%s Not Allowed' % request.method
    )
    return http.HttpResponse(status=405, content=template.render(RequestContext(request, model)))

def server_error(*args, **kwargs):
    # send error at application/__init__.py
    template = loader.get_template('error/default.html')
    model = ErrorModel(
        status=500,
        exception='這一定是宿命'
    )
    return http.HttpResponseServerError(template.render(Context(model)))