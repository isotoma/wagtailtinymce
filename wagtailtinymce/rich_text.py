# Copyright (c) 2016, Isotoma Limited
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#     * Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#     * Neither the name of the Isotoma Limited nor the
#       names of its contributors may be used to endorse or promote products
#       derived from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL ISOTOMA LIMITED BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
# THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

from __future__ import absolute_import, unicode_literals

import json

from django.forms import widgets
from django.utils import translation
from wagtail.utils.widgets import WidgetWithScript
from wagtail.wagtailadmin.edit_handlers import RichTextFieldPanel
from wagtail.wagtailcore.rich_text import DbWhitelister
from wagtail.wagtailcore.rich_text import expand_db_html, get_link_handler, get_embed_handler
from wagtail.wagtailcore.whitelist import allow_without_attributes, attribute_rule, check_url


class DbTinymceWhitelister(DbWhitelister):
    """
    A custom whitelisting engine to convert the HTML as returned by the rich text editor
    into the pseudo-HTML format stored in the database (in which images, documents and other
    linked objects are identified by ID rather than URL):

    * implements a 'construct_whitelister_element_rules' hook so that other apps can modify
      the whitelist ruleset (e.g. to permit additional HTML elements beyond those in the base
      Whitelister module);
    * replaces any element with a 'data-embedtype' attribute with an <embed> element, with
      attributes supplied by the handler for that type as defined in EMBED_HANDLERS;
    * rewrites the attributes of any <a> element with a 'data-linktype' attribute, as
      determined by the handler for that type defined in LINK_HANDLERS, while keeping the
      element content intact.
    """
    allow_attr = {'border': True, 'cellpadding': True, 'cellspacing': True, 'style': True, 'width': True, 'border': True,
                  'colspan': True, 'margin-left': True, 'margin-right': True, 'height': True, 'border-color': True,
                  'text-align': True, 'background-color': True, 'vertical-align': True, 'scope': True, 'font-family': True,
                  'rowspan': True, 'valign': True}
    element_rules = {
        '[document]': allow_without_attributes,
        'a': attribute_rule({'href': check_url}),
        'b': allow_without_attributes,
        'br': allow_without_attributes,
        'div': attribute_rule(allow_attr),
        'em': attribute_rule(allow_attr),
        'h1': attribute_rule(allow_attr),
        'h2': attribute_rule(allow_attr),
        'h3': attribute_rule(allow_attr),
        'h4': attribute_rule(allow_attr),
        'h5': attribute_rule(allow_attr),
        'h6': attribute_rule(allow_attr),
        'hr': allow_without_attributes,
        'i': allow_without_attributes,
        'img': attribute_rule({'src': check_url, 'width': True, 'height': True,
                               'alt': True}),
        'li': attribute_rule(allow_attr),
        'ol': attribute_rule(allow_attr),
        'p': attribute_rule(allow_attr),
        'strong': attribute_rule(allow_attr),
        'sub': attribute_rule(allow_attr),
        'sup': attribute_rule(allow_attr),
        'ul': attribute_rule(allow_attr),

        'blockquote': attribute_rule(allow_attr),
        'pre': attribute_rule(allow_attr),
        'span': attribute_rule(allow_attr),
        'code': attribute_rule(allow_attr),

        'table': attribute_rule(allow_attr),
        'caption': attribute_rule(allow_attr),
        'tbody': attribute_rule(allow_attr),
        'th': attribute_rule(allow_attr),
        'tr': attribute_rule(allow_attr),
        'td': attribute_rule(allow_attr),
    }

    @classmethod
    def clean_tag_node(cls, doc, tag):
        if 'data-embedtype' in tag.attrs:
            embed_type = tag['data-embedtype']
            # fetch the appropriate embed handler for this embedtype
            embed_handler = get_embed_handler(embed_type)
            embed_attrs = embed_handler.get_db_attributes(tag)
            embed_attrs['embedtype'] = embed_type

            embed_tag = doc.new_tag('embed', **embed_attrs)
            embed_tag.can_be_empty_element = True
            tag.replace_with(embed_tag)
        elif tag.name == 'a' and 'data-linktype' in tag.attrs:
            # first, whitelist the contents of this tag
            for child in tag.contents:
                cls.clean_node(doc, child)

            link_type = tag['data-linktype']
            link_handler = get_link_handler(link_type)
            link_attrs = link_handler.get_db_attributes(tag)
            link_attrs['linktype'] = link_type
            tag.attrs.clear()
            tag.attrs.update(**link_attrs)
        else:
            super(DbWhitelister, cls).clean_tag_node(doc, tag)


class TinyMCERichTextArea(WidgetWithScript, widgets.Textarea):

    @classmethod
    def getDefaultArgs(cls):
        return {
            'buttons': [
                [
                    ['undo', 'redo'],
                    ['styleselect'],
                    ['bold', 'italic'],
                    ['bullist', 'numlist', 'outdent', 'indent'],
                    ['table'],
                    ['link', 'unlink'],
                    ['wagtaildoclink', 'wagtailimage', 'wagtailembed'],
                    ['pastetext', 'fullscreen'],
                ]
            ],
            'language': translation.to_locale(translation.get_language() or 'en'),
            'menus': ['edit',  'insert', 'view', 'format', 'table', 'tools'],
            'options': {
                'browser_spellcheck': True,
                'noneditable_leave_contenteditable': True,
                'language_load': True,
            },
        }

    def __init__(self, attrs=None, **kwargs):
        super(TinyMCERichTextArea, self).__init__(attrs)
        self.kwargs = self.getDefaultArgs()
        if kwargs is not None:
            self.kwargs.update(kwargs)

    def get_panel(self):
        return RichTextFieldPanel

    def render(self, name, value, attrs=None):
        if value is None:
            translated_value = None
        else:
            translated_value = expand_db_html(value, for_editor=True)
        return super(TinyMCERichTextArea, self).render(name, translated_value, attrs)

    def render_js_init(self, id_, name, value):
        kwargs = {
            'options': self.kwargs.get('options', {}),
        }

        if 'buttons' in self.kwargs:
            if self.kwargs['buttons'] is False:
                kwargs['toolbar'] = False
            else:
                kwargs['toolbar'] = [
                    ' | '.join([' '.join(groups) for groups in rows])
                    for rows in self.kwargs['buttons']
                ]

        if 'language' in self.kwargs:
            if self.kwargs['language'] == 'zh_Hans':
                kwargs['language'] = 'zh_CN'

        if 'menus' in self.kwargs:
            if self.kwargs['menus'] is False:
                kwargs['menubar'] = False
            else:
                kwargs['menubar'] = ' '.join(self.kwargs['menus'])

        return "makeTinyMCEEditable({0}, {1});".format(json.dumps(id_), json.dumps(kwargs))

    def value_from_datadict(self, data, files, name):
        original_value = super(TinyMCERichTextArea,
                               self).value_from_datadict(data, files, name)
        if original_value is None:
            return None
        return DbTinymceWhitelister.clean(original_value)
