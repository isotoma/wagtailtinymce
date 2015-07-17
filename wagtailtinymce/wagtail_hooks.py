import json
import os.path

from django.templatetags.static import static
from django.utils.html import escape
from django.utils.html import format_html
from django.utils.html import format_html_join
from django.utils.safestring import mark_safe
from django.utils import translation

from wagtail.wagtailadmin.templatetags.wagtailadmin_tags import hook_output
from wagtail.wagtailcore import hooks


def to_js_primitive(string):
    return mark_safe(json.dumps(escape(string)))


@hooks.register('insert_editor_css')
def insert_editor_css():
    css_files = [
        'wagtailtinymce/css/icons.css'
    ]
    css_includes = format_html_join(
        '\n',
        '<link rel="stylesheet" href="{0}">',
        ((static(filename),) for filename in css_files),
        )
    return css_includes + hook_output('insert_tinymce_css')


@hooks.register('insert_editor_js')
def insert_editor_js():
    js_files = [
        'wagtailtinymce/js/vendor/tinymce/tinymce.jquery.js',
        'wagtailtinymce/js/rich-text-editor.js',
    ]
    js_includes = format_html_join(
        '\n',
        '<script src="{0}"></script>',
        ((static(filename),) for filename in js_files)
        )
    base_settings = format_html(
        '<script>'
        'setMCEOption("language", {});'
        'setMCEOption("language_load", true);'
        'registerMCEPlugin("wagtaillink", {});'
        '</script>',
        to_js_primitive(translation.to_locale(translation.get_language())),
        to_js_primitive(static('wagtailtinymce/js/tinymce-plugins/wagtaillink.js')),
        )
    return js_includes + base_settings + hook_output('insert_tinymce_js')


@hooks.register('insert_tinymce_js')
def images_richtexteditor_js():
    return format_html(
        """
        <script>
            registerMCEPlugin("wagtailimage", {});
            registerMCEButton('wagtailimage');
        </script>
        """,
        to_js_primitive(static('wagtailtinymce/js/tinymce-plugins/wagtailimage.js')),
    )


@hooks.register('insert_tinymce_js')
def embeds_richtexteditor_js():
    return format_html(
        '<script>'
        'registerMCEPlugin("noneditable");'
        'setMCEOption("noneditable_leave_contenteditable", true);'
        'registerMCEPlugin("wagtailembeds", {});'
        'registerMCEButton("wagtailembeds");'
        '</script>',
        to_js_primitive(static('wagtailtinymce/js/tinymce-plugins/wagtailembeds.js')),
        )


@hooks.register('insert_tinymce_js')
def docs_richtexteditor_js():
    return format_html(
        """
        <script>
            registerMCEPlugin("wagtaildoclink", {});
            registerMCEButton('wagtaildoclink');
        </script>
        """,
        to_js_primitive(static('wagtailtinymce/js/tinymce-plugins/wagtaildoclink.js'))
    )
