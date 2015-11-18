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
    * Neither the name of the Isotoma Limited nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL ISOTOMA LIMITED BE LIABLE FOR ANY
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
        tinymce.PluginManager.requireLangPack('wagtailimage', mceOptions.language);
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
                stateSelector: 'img,[data-embedtype=image]'
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
