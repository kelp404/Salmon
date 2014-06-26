import unittest
from mock import MagicMock, patch
from application.tests import patcher
from application import utils


class TestUtilsModels(unittest.TestCase):
    def setUp(self):
        self.request = MagicMock()

    @patcher(
        patch('django.conf.settings.DEBUG', new_callable=MagicMock(return_value='debug')),
    )
    def test_utils_is_debug(self):
        is_debug = utils.is_debug()
        self.assertEqual(is_debug, 'debug')

    def test_utils_current_language_zh_tw(self):
        self.request.META = {
            'HTTP_ACCEPT_LANGUAGE': 'zh-TW,zh;q=0.8,en;q=0.6'
        }
        code = utils.current_language(self.request)
        self.assertEqual(code, 'zh-tw')
    def test_utils_current_language_zh_hk(self):
        self.request.META = {
            'HTTP_ACCEPT_LANGUAGE': 'zh-HK,zh;q=0.8,en;q=0.6'
        }
        code = utils.current_language(self.request)
        self.assertEqual(code, 'zh-tw')
    def test_utils_current_language_ja_jp(self):
        self.request.META = {
            'HTTP_ACCEPT_LANGUAGE': 'ja-JP,en;q=0.6'
        }
        code = utils.current_language(self.request)
        self.assertEqual(code, 'en')
    def test_utils_current_language_en(self):
        self.request.META = {
            'HTTP_ACCEPT_LANGUAGE': 'en'
        }
        code = utils.current_language(self.request)
        self.assertEqual(code, 'en')

    def test_utils_parse_keyword(self):
        keyword = 'apple -banana index'
        plus, minus = utils.parse_keyword(keyword)
        self.assertListEqual(plus, [
            'apple',
            'index',
        ])
        self.assertListEqual(minus, [
            'banana'
        ])

    @patcher(
        patch('application.utils.search', new_callable=MagicMock()),
    )
    def test_utils_get_index_users(self):
        utils.search.Index.return_value = 'index'
        index = utils.get_index_users()
        self.assertEqual(index, 'index')
        utils.search.Index.assert_called_with(namespace='UserModel', name='default')
    @patcher(
        patch('application.utils.search', new_callable=MagicMock()),
    )
    def test_utils_get_index_issues(self):
        utils.search.Index.return_value = 'index'
        index = utils.get_index_issues(100)
        self.assertEqual(index, 'index')
        utils.search.Index.assert_called_with(namespace='IssueModel', name='100')

    def test_utils_get_iso_format(self):
        dt = MagicMock()
        dt.strftime.return_value = 'strftime'
        result = utils.get_iso_format(dt)
        dt.strftime.assert_called_with('%Y-%m-%dT%H:%M:%S.%fZ')
        self.assertEqual(result, 'strftime')

    def test_utils_float_filter(self):
        self.assertEqual(1.2, utils.float_filter(1.2))
        self.assertEqual(0.0, utils.float_filter(None))
        self.assertTrue(isinstance(utils.float_filter(None), float))
        self.assertEqual(0.0, utils.float_filter(''))
        self.assertTrue(isinstance(utils.float_filter(''), float))

    def test_utils_int_filter(self):
        self.assertEqual(1, utils.int_filter(1))
        self.assertEqual(0, utils.int_filter(None))
        self.assertTrue(isinstance(utils.int_filter(None), int))
        self.assertEqual(0, utils.int_filter(None))
        self.assertTrue(isinstance(utils.int_filter(''), int))
