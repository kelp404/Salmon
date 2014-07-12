from google.appengine.ext import db
from google.appengine.api import users, mail, search
from django.conf import settings
from application import utils
from application.models.datastore.base_model import BaseModel


class UserPermission(object):
    anonymous = 0
    root = 1
    normal = 2
    advanced = 3

class UserModel(BaseModel):
    email = db.EmailProperty()
    name = db.StringProperty()
    permission = db.IntegerProperty(default=UserPermission.anonymous)
    create_time = db.DateTimeProperty(auto_now_add=True)

    def __str__(self):
        if self.email:
            return '%s<%s>' % (self.name, self.email)
        else:
            return ''

    @property
    def is_login(self):
        return not not self.has_key()

    def dict(self):
        return {
            'id': self.key().id() if self.has_key() else None,
            'name': self.name,
            'email': self.email,
            'permission': self.permission,
            'create_time': utils.get_iso_format(self.create_time)
        }

    @classmethod
    def search(self, keyword, index, size):
        """
        Search users with keyword.
        :param keyword: {string} The keyword.
        :param index: {int} The page index.
        :param size: {int} The page size.
        :return: ({list}, {int})
            The UserModel list.
            The number found.
        """
        plus, minus = utils.parse_keyword(keyword)
        query_string = ''
        if len(plus) > 0:
            keyword = ' '.join(plus)
            query_string += '((name:{1}) OR (email:{1}))'.replace('{1}', keyword)
        if len(minus) > 0:
            keyword = ' '.join(minus)
            query_string += 'NOT ((name:{1}) OR (email:{1}))'.replace('{1}', keyword)
        name_asc = search.SortExpression(
            expression='name',
            direction=search.SortExpression.ASCENDING,
            default_value=0,
        )
        options = search.QueryOptions(
            offset=size * index,
            limit=size,
            sort_options=search.SortOptions(expressions=[name_asc], limit=1000),
            returned_fields=['doc_id'],
        )
        query = search.Query(query_string=query_string, options=options)
        search_result = utils.get_index_users().search(query)
        total = search_result.number_found
        users = UserModel.get_by_id([long(x.doc_id) for x in search_result])
        return [x for x in users if not x is None], total

    def put(self, **kwargs):
        super(UserModel, self).put(**kwargs)
        index = utils.get_index_users()
        document = search.Document(
            doc_id=str(self.key().id()),
            fields=[
                search.TextField(name='name', value=self.name),
                search.TextField(name='email', value=self.email),
            ]
        )
        index.put(document)
    def delete(self, **kwargs):
        index = utils.get_index_users()
        index.delete(str(self.key().id()))
        super(UserModel, self).delete(**kwargs)

    @classmethod
    def authorization(cls):
        """
        User Authorization.
        :returns: UserModel
        """
        google_user = users.get_current_user()
        if not google_user:
            # didn't login with google account
            return UserModel()

        if UserModel.all().count(1) == 0:
            # set up default user with google account
            user = cls.__register_user(google_user, UserPermission.root)
            return user

        if google_user:
            # auth with google account
            members = UserModel.gql('where email = :1', google_user.email().lower()).fetch(1)
            if len(members) > 0:
                # got the user
                return members[0]
            elif getattr(settings, 'ALLOW_REGISTER', False):
                # register a new user
                return cls.__register_user(google_user, UserPermission.normal)
        return UserModel()

    @classmethod
    def invite_user(cls, request, email):
        users = UserModel.all().filter('email =', email).fetch(1)
        if len(users):
            # the user is exist
            return users[0]
        else:
            user = UserModel(
                name=email,
                email=email,
                permission=UserPermission.normal,
            )
            user.put()
            gae_account = getattr(settings, 'GAE_ACCOUNT')
            domain = getattr(settings, 'HOST')
            message = mail.EmailMessage(sender=gae_account, subject="%s has invited you to join Victorique." % request.user.name)
            message.to = user.email
            message.body = 'Victorique https://%s\n\nAccount: %s' % (domain, user.email)
            message.send()
            return user

    @classmethod
    def __register_user(cls, google_user, permission=UserPermission.normal):
        """
        Register the user.
        :param google_user: The google.appengine.api.users.get_current_user().
        :param permission: The user's permission.
        :return: The datastore.user_model.UserModel object.
        """
        user = UserModel(
            email=google_user.email().lower(),
            name=google_user.nickname(),
            permission=permission,
        )
        user.put()
        return user
