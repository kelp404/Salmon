from wtforms import Form, StringField, IntegerField, BooleanField, validators
from application import utils
from application.forms import ArrayField


class IssueSearchForm(Form):
    """
    The form for search issues.
    """
    keyword = StringField(
        filters=[lambda x: x.strip() if isinstance(x, basestring) else None],
    )
    status = StringField(
        default='all',
        filters=[lambda x: x.strip() if isinstance(x, basestring) else None],
    )
    floor_lowest = IntegerField(
        default=0,
        filters=[utils.int_filter],
    )
    floor_highest = IntegerField(
        default=0,
        filters=[utils.int_filter],
    )
    room = StringField(
        filters=[lambda x: x.strip() if isinstance(x, basestring) else None],
    )
    index = IntegerField(
        default=0,
        filters=[utils.int_filter],
    )

class IssueForm(Form):
    """
    The form for update the issue.
    """
    title = StringField(
        validators=[validators.required()],
        filters=[lambda x: x.strip() if isinstance(x, basestring) else None],
    )
    floor = IntegerField(
        filters=[utils.int_filter],
    )
    room = StringField(
        default='-',
        filters=[lambda x: x.strip() if isinstance(x, basestring) else None],
    )
    content = StringField(
        filters=[lambda x: x.strip() if isinstance(x, basestring) else None],
    )
    label_ids = ArrayField()
    is_close = BooleanField(
        default=False,
    )
