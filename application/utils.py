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
    request.META['HTTP_ACCEPT_LANGUAGE']: `zh-TW,zh;q=0.8,en;q=0.6`
    :param request: The django request.
    :return: {string}
    """
    languages = [x.split(';', 1)[0].lower() for x in request.META.get('HTTP_ACCEPT_LANGUAGE', '').split(',')]
    for language in languages:
        if language.startswith('zh'):
            return 'zh-tw'
    return 'en'

def get_bleach_allow_tags():
    return [
        'hr',
        'img',
        'p', 'span',
        'a',
        'del',
        'br',
        'table', 'thead', 'th', 'tbody', 'tr', 'td',
        'b',
        'blockquote',
        'code',
        'i',
        'li',
        'ol',
        'strong',
        'ul',
        'div'
        'h1', 'h2', 'h3', 'h4', 'h5',
    ]
def get_bleach_allow_attributes():
    return {
        'a': ['href', 'title'],
        'p': ['style'],
        'img': ['src', 'style'],
    }
def get_bleach_allow_styles():
    return [
        'font-family',
        'font-weight',
        'text-align',
        'color',
        'width',
        'margin-left',
        'background-color',
    ]

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
def get_index_issues(project_id):
    """
    Get the the text search index of IssueModel.
    :return:
    """
    return search.Index(namespace='IssueModel', name=str(project_id))

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
