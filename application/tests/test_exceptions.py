import unittest
from mock import MagicMock, patch
from application.tests import patcher
from application.exceptions import *


class TestExceptions(unittest.TestCase):
    def setUp(self):
        self.request = MagicMock()
        self.request.META.return_value = {
            'HTTP_ACCEPT_LANGUAGE': 'zh-TW,zh;q=0.8,en;q=0.6',
        }

    @patcher(
        patch('application.views.error.Victorique.send', new=MagicMock())
    )
    def test_exceptions_application_exception(self):
        self.assertTrue(issubclass(ApplicationException, Exception))
        ex = ApplicationException()
        response = ex.view(self.request)
        self.assertEqual(response.status_code, 500)

    @patcher(
        patch('application.views.error.Victorique.send', new=MagicMock())
    )
    def test_exceptions_http400(self):
        self.assertTrue(issubclass(Http400, ApplicationException))
        ex = Http400()
        response = ex.view(self.request)
        self.assertEqual(response.status_code, 400)

    @patcher(
        patch('application.views.error.Victorique.send', new=MagicMock())
    )
    def test_exceptions_http403(self):
        self.assertTrue(issubclass(Http400, ApplicationException))
        ex = Http403()
        response = ex.view(self.request)
        self.assertEqual(response.status_code, 403)

    @patcher(
        patch('application.views.error.Victorique.send', new=MagicMock())
    )
    def test_exceptions_http404(self):
        self.assertTrue(issubclass(Http400, ApplicationException))
        ex = Http404()
        response = ex.view(self.request)
        self.assertEqual(response.status_code, 404)

    @patcher(
        patch('application.views.error.Victorique.send', new=MagicMock())
    )
    def test_exceptions_http405(self):
        self.assertTrue(issubclass(Http400, ApplicationException))
        ex = Http405()
        response = ex.view(self.request)
        self.assertEqual(response.status_code, 405)

    @patcher(
        patch('application.views.error.Victorique.send', new=MagicMock())
    )
    def test_exceptions_http500(self):
        self.assertTrue(issubclass(Http400, ApplicationException))
        ex = Http500()
        response = ex.view(self.request)
        self.assertEqual(response.status_code, 500)
