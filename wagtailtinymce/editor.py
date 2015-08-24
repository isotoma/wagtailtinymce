import json

from wagtail.wagtailcore.fields import BaseRichTextEditor


class TinyMCEEditor(BaseRichTextEditor):

    def render_js_init(self, id_, name, value):
        return "makeTinyMCEEditable({0});".format(json.dumps(id_))
