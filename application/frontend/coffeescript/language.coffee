window._ = (key) ->
    result = window.languageResource[key]
    if result? then result else key
