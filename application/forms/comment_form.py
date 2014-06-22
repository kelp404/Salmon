from wtforms import Form, StringField, validators


class CommentForm(Form):
    """
    The form for update the comment.
    """
    comment = StringField(
        validators=[validators.required()],
        filters=[lambda x: x.strip() if isinstance(x, basestring) else None],
    )
