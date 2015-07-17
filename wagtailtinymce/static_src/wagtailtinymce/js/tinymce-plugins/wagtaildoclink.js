/*
Copyright (c) 2015, Isotoma Limited
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function() {
    'use strict';

    (function($) {

        tinymce.PluginManager.requireLangPack('wagtaildoclink', mceOptions.language);
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
