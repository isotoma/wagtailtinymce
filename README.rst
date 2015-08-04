===============
Wagtail TinyMCE
===============

Wagtail TinyMCE offers integration of the
`TinyMCE rich text editor <http://www.tinymce.com>`_ into the
`Wagtail CMS <http://wagtail.io>`_.

This currently relies on a `pull-request`_ to Wagtail being accepted
and so is not supported by any current version of Wagtail.

.. _`pull-request`: https://github.com/torchbox/wagtail/pull/1521

Installation
============

Add ``wagtailtinymce`` to your |INSTALLED_APPS Django setting|_ and
remove ``wagtail.wagtailhalloeditor``.

.. |INSTALLED_APPS Django setting| replace:: ``INSTALLED_APPS`` Django setting
.. _`INSTALLED_APPS Django setting`: https://docs.djangoproject.com/en/1.8/ref/settings/#installed-apps

Customization
=============

To inject JavaScript when the TinyMCE page editor is loaded, used the
``insert_tinymce_js`` hook. Once you have the hook in place use the
following JavaScript to register the plugin with TinyMCE:

.. code-block:: javascript

    registerMCEPlugin(name, path);

For example:

.. code-block:: javascript

    registerMCEPlugin('myplugin', '/static/js/my-tinymce-plugin.js');

A complete ``wagtail_hooks.py`` file example:

.. code-block:: python

    import json

    from django.templatetags.static import static
    from django.utils.html import format_html
    from django.utils.safestring import mark_safe
    from wagtail.wagtailcore import hooks

    @hooks.register('insert_tinymce_js')
    def my_plugin_js():
        return format_html(
            """
            <script>
                registerMCEPlugin("myplugin", {});
            </script>
            """,
            mark_safe(json.dumps(static('js/my-tinymce-plugin.js'))),
        )

Similarly you can register buttons for the TinyMCE toolbar:

.. code-block:: javascript

    registerMCEButton(name);

and set configuration options:

.. code-block:: javascript

    setMCEOption('skin_url', '/static/js/my-mce-skin/');

Versioning
==========
The version number of this package is the TinyMCE version, followed by
the release number of this package for that TinyMCE version.
