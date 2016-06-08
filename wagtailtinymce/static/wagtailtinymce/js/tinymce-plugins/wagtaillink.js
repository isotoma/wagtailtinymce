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

    function createLink(pageData, currentText)
    {
        var a, text;

        // Create link
        a = document.createElement('a');
        a.setAttribute('href', pageData.url);
        if (pageData.id) {
            a.setAttribute('data-id', pageData.id);
            a.setAttribute('data-parent-id', pageData.parentId);
            a.setAttribute('data-linktype', 'page');
            // If it's a link to an internal page, `pageData.title` will not use the link_text
            // like external and email responses do, overwriting selection text :(
            text = currentText || pageData.title;
        }
        else {
            text = pageData.title;
        }
        a.appendChild(document.createTextNode(text));

        return a;
    }

    (function($) {
        tinymce.PluginManager.add('wagtaillink', function (editor) {

            function showDialog() {
                var url, urlParams, mceSelection, $currentNode, $targetNode, currentText, insertElement;

                currentText = '';
                url = window.chooserUrls.pageChooser;
                urlParams = {
                    'allow_external_link': true,
                    'allow_email_link': true
                };

                mceSelection = editor.selection;
                $currentNode = $(mceSelection.getEnd());
                // target selected link (if any)
                $targetNode = $currentNode.closest('a[href]');

                if ($targetNode.length) {
                    currentText = $targetNode.text();
                    var linkType = $targetNode.data('linktype');
                    var parentPageId = $targetNode.data('parent-id');
                    var href = $targetNode.attr('href');
                    if (linkType == 'page' && parentPageId) {
                        url = window.chooserUrls.pageChooser + parentPageId.toString() + '/';
                    }
                    else if (href.startsWith('mailto:')) {
                        url = window.chooserUrls.emailLinkChooser;
                        href = href.replace('mailto:', '');
                        urlParams['link_url'] = href;
                    }
                    else if (!linkType) {
                        url = window.chooserUrls.externalLinkChooser;
                        urlParams['link_url'] = href;
                    }
                    if( $targetNode.children().length == 0 )
                    {
                        // select and replace text-only target
                        insertElement = function(elem) {
                            mceSelection.select($targetNode.get(0));
                            mceSelection.setNode(elem);
                        };
                    }
                    else {
                        // replace attributes of complex target
                        insertElement = function(elem) {
                            mceSelection.select($targetNode.get(0));
                            var $elem = $(elem);
                            $targetNode.attr('href', $elem.attr('href'));
                            if ($elem.data('linktype')) {
                                $targetNode.data($elem.data());
                            }
                            else {
                                $targetNode.removeData('linktype');
                                $targetNode.removeAttr('data-linktype');
                            }
                        };
                    }
                }
                else {
                    if (!mceSelection.isCollapsed()) {
                        currentText = mceSelection.getContent({format: 'text'});
                    }
                    // replace current selection
                    insertElement = function(elem) {
                        mceSelection.setNode(elem);
                    };
                }

                urlParams['link_text'] = currentText;

                ModalWorkflow({
                    url: url,
                    urlParams: urlParams,
                    responses: {
                        pageChosen: function(pageData) {
                            editor.undoManager.transact(function() {
                                editor.focus();
                                insertElement(createLink(pageData, currentText));
                            });
                        }
                    }
                });
            }

            editor.addButton('link', {
                icon: 'link',
                tooltip: 'Insert/edit link',
                shortcut: 'Meta+K',
                onclick: showDialog,
                stateSelector: 'a[data-linktype=page],a[href]:not([data-linktype])'
            });

            editor.addButton('unlink', {
                icon: 'unlink',
                tooltip: 'Remove link',
                cmd: 'unlink',
                stateSelector: 'a[data-linktype=page],a[href]'
            });

            editor.addMenuItem('link', {
                icon: 'link',
                text: 'Insert/edit link',
                shortcut: 'Meta+K',
                onclick: showDialog,
                stateSelector: 'a[data-linktype=page],a[href]:not([data-linktype])',
                context: 'insert',
                prependToContext: true
            });

            editor.addShortcut('Meta+K', '', showDialog);
            editor.addCommand('mceLink', showDialog);
        });
    })(jQuery);

}).call(this);
