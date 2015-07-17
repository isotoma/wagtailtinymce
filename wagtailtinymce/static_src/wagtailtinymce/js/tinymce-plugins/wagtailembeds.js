(function() {
    'use strict';

    (function($) {
        tinymce.PluginManager.requireLangPack('wagtailembeds', mceOptions.language);
        tinymce.PluginManager.add('wagtailembeds', function(editor) {

            function showDialog() {
                var insertionPoint, lastSelection;

                lastSelection = editor.selection;
                insertionPoint = $(lastSelection.endContainer).parentsUntil('.richtext').last();

                ModalWorkflow({
                    url: window.chooserUrls.embedsChooser,
                    responses: {
                        embedChosen: function(embedData) {
                            var elem;

                            elem = $(embedData).get(0);
                            editor.undoManager.transact(function() {
                                lastSelection.setNode(elem);
                                if (elem.getAttribute('contenteditable') === 'false') {
                                    insertRichTextDeleteControl(elem);
                                }
                            });
                        }
                    }
                });
            }

            editor.addButton('wagtailembeds', {
                icon: 'media',
                tooltip: 'Insert/edit media',
                onclick: showDialog,
                stateSelector: ['.embed-placeholder, .embed-placeholder *']
            });

            editor.addMenuItem('wagtailembeds', {
                icon: 'media',
                text: 'Insert/edit media',
                onclick: showDialog,
                context: 'insert',
                prependToContext: true
            });

            editor.addCommand('mceWagtailEmbeds', showDialog);

            if (editor && editor.plugins.contextmenu){
                editor.plugins.contextmenu.onContextMenu.add(function(plugin, menu, element) {
                    if (element.nodName === 'IMG' && element.hasAttribute('data-mce-src')) {
                        menu.add({title: 'wagtailembeds', icon : 'media', cmd : 'mceWagtailEmbeds'});
                    }
                });
            }

        });
    })(jQuery);

}).call(this);
