from django.conf import settings


def get_default_buttons():
    """
    Return set of buttons for the Django project, or use
    the default.
    """

    default_button_list = [
        ['undo', 'redo'],
        ['styleselect'],
        ['bold', 'italic'],
        ['bullist', 'numlist', 'outdent', 'indent'],
        ['table'],
        ['link', 'unlink'],
        ['wagtaildoclink', 'wagtailimage', 'wagtailembed'],
        ['pastetext', 'fullscreen'],
    ]

    return getattr(settings, 'WAGTAILTINYMCE_BUTTON_LIST', default_button_list)
