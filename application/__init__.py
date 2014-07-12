import os, traceback
from django.core.wsgi import get_wsgi_application
from application.victorique import Victorique


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "application.settings")
app = get_wsgi_application()

origin_handler = app.handle_uncaught_exception
def exception_handler(request, resolver, exc_info):
    from django.conf import settings
    exc_type, exc_value, exc_traceback = exc_info
    v = Victorique(getattr(settings, 'VICTORIQUE_URL'), str(request.user))
    v.send('exception: %s' % str(exc_value), {
        'method': request.method,
        'path': request.get_host() + request.get_full_path(),
        'traceback': traceback.format_exc(20),
    })
    return origin_handler(request, resolver, exc_info)
app.handle_uncaught_exception = exception_handler
