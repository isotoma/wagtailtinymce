#!/usr/bin/env python
import json
import os

import django
from django.conf import settings
from django.utils import translation
from django.utils.translation.trans_real import all_locale_paths
import polib


BASE_DIR = os.path.abspath(os.path.join(
    os.path.dirname(os.path.dirname(__file__))
    ))
TINYMCE_PLUGINS_LANG_DIR = os.path.join(
    BASE_DIR, 'wagtailtinymce', 'static_src', 'wagtailtinymce', 'js',
    'tinymce-plugins', 'langs'
    )
POTFILE = os.path.join(TINYMCE_PLUGINS_LANG_DIR, 'wagtailtinymce.pot')


TEMPLATE = 'tinymce.addI18n("{lang}", {entries});'


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wagtail.tests.settings')
    settings.INSTALLED_APPS  # looks like a no-op, but loads the settings
    if settings.configured:
        django.setup()

    translations = {}

    available_languages = set()
    for path in all_locale_paths():
        available_languages |= set([
            filename for filename in os.listdir(path)
            if os.path.isdir(os.path.join(path, filename))
            ])

    print('Generating new translation files...')
    required_translations = [entry.msgid for entry in polib.pofile(POTFILE)]
    for lang in available_languages:
        translation.activate(lang)
        entries = translations.setdefault(lang, {})
        for msgid in required_translations:
            msgstr = translation.ugettext(msgid)
            entries[msgid] = msgstr
        translation.deactivate()

    for lang, entries in translations.items():
        filename = os.path.join(TINYMCE_PLUGINS_LANG_DIR, '{}.js'.format(lang))
        print(filename)
        with open(filename, 'w') as outfile:
            outfile.write(TEMPLATE.format(
                lang=lang,
                entries=json.dumps(entries, indent=0, separators=(',', ': '))
                ))
    print('Done.')


if __name__ == '__main__':
    main()
