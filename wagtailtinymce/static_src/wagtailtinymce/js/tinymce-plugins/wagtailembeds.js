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
