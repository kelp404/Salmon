from wtforms import Form, StringField, validators


class LabelForm(Form):
    """
    The form for update the label.
    """
    title = StringField(
        validators=[validators.required()],
        filters=[lambda x: x.strip() if isinstance(x, basestring) else None],
    )
