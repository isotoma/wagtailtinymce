#!/usr/bin/env python
import json
import os

import polib
from txclib.commands import cmd_pull
from txclib.utils import find_dot_tx


BASE_DIR = os.path.abspath(os.path.join(
    os.path.dirname(os.path.dirname(__file__))
    ))
TRANSLATION_DIR = os.path.join(BASE_DIR, 'translations')
TINYMCE_DIR = os.path.join(
    BASE_DIR, 'wagtailtinymce', 'static_src', 'wagtailtinymce', 'js',
    'vendor', 'tinymce'
    )


TEMPLATE = 'tinymce.addI18n("{lang}", {entries});'


def main():
    # Pull latest translations
    cmd_pull(['-a'], find_dot_tx())

    print('Finding translations...')
    translations = {}
    for dirpath, _dirnames, filenames in os.walk(TRANSLATION_DIR):
        for filename in filenames:
            if os.path.splitext(filename)[1] != '{}po'.format(os.path.extsep):
                continue
            po = polib.pofile(os.path.join(dirpath, filename))
            entries = translations.setdefault(po.metadata['Language'], {})
            for entry in po:
                entries[entry.msgid] = entry.msgstr

    print('Generating new translation files...')
    for lang, entries in translations.items():
        filename = os.path.join(TINYMCE_DIR, 'langs', '{}.js'.format(lang))
        print(filename)
        with open(filename, 'w') as outfile:
            outfile.write(TEMPLATE.format(
                lang=lang,
                entries=json.dumps(entries, indent=0, separators=(',', ': '))
                ))
    print('Done.')


if __name__ == '__main__':
    main()
