/*
Copyright (c) 2016, Isotoma Limited
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
        tinymce.PluginManager.add('wagtailimage', function(editor) {

            /* stop editing and resizing of embedded image content */
            function fixContent() {
                $(editor.getBody()).find('[data-embedtype=image]').each(function () {
                    $(this).attr('contenteditable', false).attr('data-mce-contenteditable', 'false').find('div,table,img').attr('data-mce-resize', 'false');
                });
            }

            function showDialog() {
                var url, urlParams, mceSelection, $currentNode, $targetNode, insertElement;

                mceSelection = editor.selection;
                $currentNode = $(mceSelection.getEnd());
                // target selected image (if any)
                $targetNode = $currentNode.closest('[data-embedtype=image]');
                if ($targetNode.length) {
                    url = window.chooserUrls.imageChooserSelectFormat;
                    url = url.replace('00000000', $targetNode.data('id'));
                    urlParams = {
                        edit: 1,
                        format: $targetNode.data('format'),
                        alt_text: $targetNode.data('alt'),
                        caption: $targetNode.data('caption')
                    };
                    // select and replace target
                    insertElement = function(elem) {
                        mceSelection.select($targetNode.get(0));
                        mceSelection.setNode(elem);
                    };
                }
                else {
                    url = window.chooserUrls.imageChooser;
                    urlParams = {
                        select_format: true
                    };
                    // otherwise target immediate child of nearest div container
                    $targetNode = $currentNode.parentsUntil('div:not([data-embedtype])').not('body,html').last();
                    if (0 == $targetNode.length) {
                        // otherwise target current node
                        $targetNode = $currentNode;
                    }
                    // select and insert after target
                    insertElement = function(elem) {
                        $(elem).insertBefore($targetNode);
                        mceSelection.select(elem);
                    };
                }

                ModalWorkflow({
                    url: url,
                    urlParams: urlParams,
                    responses: {
                        imageChosen: function(imageData) {
                            var elem = $(imageData.html).get(0);
                            editor.undoManager.transact(function() {
                                editor.focus();
                                insertElement(elem);
                                fixContent();
                            });
                        }
                    }
                });
            }

            editor.addButton('wagtailimage', {
                icon: 'image',
                tooltip: 'Insert/edit image',
                onclick: showDialog,
                stateSelector: '[data-embedtype=image]'
            });

            editor.addMenuItem('wagtailimage', {
                icon: 'image',
                text: 'Insert/edit image',
                onclick: showDialog,
                context: 'insert',
                prependToContext: true
            });

            editor.addCommand('mceWagtailImage', showDialog);

            editor.on('LoadContent', function (e) {
                fixContent();
            });
        });
    })(jQuery);

}).call(this);
