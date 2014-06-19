from application import utils

def debug(request):
    return {
        'debug': utils.is_debug()
    }

def language(request):
    code = utils.current_language(request)
    return {
        'lang_code': utils.current_language(request),
        'lang_code_redactor': code if code != 'en' else None,
    }
