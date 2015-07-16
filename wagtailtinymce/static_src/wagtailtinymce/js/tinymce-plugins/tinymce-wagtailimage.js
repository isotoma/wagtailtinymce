(function() {
    'use strict';

    (function($) {
        tinymce.PluginManager.add('wagtailimage', function(editor) {

            function showDialog() {
                var insertionPoint, lastSelection;

                lastSelection = editor.selection;
                insertionPoint = $(lastSelection.endContainer).parentsUntil('.richtext').last();

                ModalWorkflow({
                    url: window.chooserUrls.imageChooser + '?select_format=true',
                    responses: {
                        imageChosen: function(imageData) {
                            var elem;

                            elem = $(imageData.html).get(0);

                            editor.undoManager.transact(function() {
                                editor.focus();
                                editor.selection.setNode(elem);
                                if (elem.getAttribute('contenteditable') === 'false') {
                                    insertRichTextDeleteControl(elem);
                                }
                            });
                        }
                    }
                });
            }

            editor.addButton('wagtailimage', {
                icon: 'image',
                tooltip: 'Insert/edit image',
                onclick: showDialog,
                stateSelector: 'img:not([data-mce-object],[data-mce-placeholder],[data-mce-editable=false])'
            });

            editor.addMenuItem('wagtailimage', {
                icon: 'image',
                text: 'Insert/edit image',
                onclick: showDialog,
                context: 'insert',
                prependToContext: true
            });

            editor.addCommand('mceWagtailImage', showDialog);

        });

    })(jQuery);

}).call(this);
