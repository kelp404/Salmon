from google.appengine.api import search
from django.conf import settings


default_page_size = 20

def is_debug():
    """
    Is debug mode?
    :return: True / False
    """
    return getattr(settings, "DEBUG", True)

def current_language(request):
    """
    Get current language code.
    :param request: The django request.
    :return: {string}
    """
    return 'zh-tw'

def parse_keyword(keyword):
    """
    Parse keyword.
    :param keyword: {string}
    :return: ({string}, {string})
    """
    source = [x for x in keyword.split()]
    plus = [x for x in source if not x.startswith('-')]
    minus = [x[1:] for x in source if x.startswith('-')]
    return plus, minus

def get_index_users():
    """
    Get the the text search index of UserModel.
    :return:
    """
    return search.Index(namespace='UserModel', name='default')

def get_iso_format(date_time):
    """
    :param date_time: {datetime} The datetime.
    :return: The iso format datetime "yyyy-MM-ddTHH:mm:ss.ssssssZ"
    """
    return date_time.strftime('%Y-%m-%dT%H:%M:%S.%fZ')

def float_filter(value):
    """
    The float filter for wtforms.
    """
    try:
        return float(value)
    except:
        return 0.0

def int_filter(value):
    """
    The int filter for wtforms.
    """
    try:
        return int(value)
    except:
        return 0
