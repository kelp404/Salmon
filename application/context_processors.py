from application import utils

def debug(request):
    return {
        'debug': utils.is_debug()
    }

def language(request):
    return {
        'lang_code': utils.current_language(request)
    }
