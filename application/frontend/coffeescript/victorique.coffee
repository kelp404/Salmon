window.victorique =
    send: (args={}) ->
        $.ajax
            method: 'get'
            dataType: 'jsonp'
            url: 'https://victorique-demo.appspot.com/api/applications/24c1ce30-f9f5-11e3-99ab-4bfec4a2f6a3/logs'
            data:
                title: args.title
                user: args.user
                document: JSON.stringify(args.document)
