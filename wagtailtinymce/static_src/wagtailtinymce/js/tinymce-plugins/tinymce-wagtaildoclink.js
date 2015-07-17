(function() {
    'use strict';

    (function($) {

        tinymce.PluginManager.add('wagtaildoclink', function(editor) {
            function showDialog() {
                var lastSelection, text;

                lastSelection = editor.selection;
                text = lastSelection.getContent({format: 'text'});

                ModalWorkflow({
                    url: window.chooserUrls.documentChooser,
                    responses: {
                        documentChosen: function(docData) {
                            var a;

                            editor.undoManager.transact(function() {
                                a = document.createElement('a');
                                a.setAttribute('href', docData.url);
                                a.setAttribute('data-id', docData.id);
                                a.setAttribute('data-linktype', 'document');
                                if ((!lastSelection.getRng().collapsed) && lastSelection.canSurroundContents()) {
                                    lastSelection.surroundContents(a);
                                } else {
                                    a.appendChild(document.createTextNode(docData.title));
                                    lastSelection.setContent(a);
                                }
                            });
                        }
                    }
                });
            }

            editor.addButton('wagtaildoclink', {
                icon: 'doc-full',
                tooltip: 'Documents',
                onclick: showDialog,
                stateSelector: 'a[data-linktype=document]'
            });

            editor.addMenuItem('wagtaildoclink', {
                icon: 'doc-full',
                text: 'Documents',
                onclick: showDialog,
                context: 'insert',
                prependToContext: true
            });

            editor.addCommand('mceWagtailDocuments', showDialog);
        });
    })(jQuery);

}).call(this);
