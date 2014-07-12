import json, requests


class Victorique(object):
    def __init__(self, api_url, user):
        self.api_url = api_url
        self.user = user

    def send(self, title, document=None):
        headers = {'Content-type': 'application/json'}
        data = {
            'title': title,
            'user': self.user,
            'document': document,
        }
        try:
            requests.post(self.api_url, data=json.dumps(data), headers=headers)
        except:
            import logging
            logging.error('error report send failed.')