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
        var linkPlugin = tinymce.PluginManager.get('wagtaillink');

        function DocLinkPlugin(editor) {
            this.editor = editor;
            this.hook();
        }
        $.extend(DocLinkPlugin.prototype, linkPlugin.prototype, {
            responseType: 'documentChosen',
            hook: function() {
                var self = this;
                this.editor.addButton('wagtaildoclink', {
                    icon: 'doc-full',
                    tooltip: 'Documents',
                    onclick: function () { return self.showDialog(); },
                    stateSelector: 'a[data-linktype=document]'
                });

                this.editor.addMenuItem('wagtaildoclink', {
                    icon: 'doc-full',
                    text: 'Documents',
                    onclick: function () { return self.showDialog(); },
                    context: 'insert',
                    prependToContext: true
                });

                this.editor.addCommand('mceWagtailDocuments', function () { return self.showDialog(); });
            },
            getChooserUrl: function () {
                return window.chooserUrls.documentChooser;
            },
            getLinkAttrs: function (docData, text) {
                var href = docData.url || docData.edit_link,
                    title = (
                        docData.title
                        ? (docData.title === href && text.length ? text : docData.title)
                        : text
                    );
                return {
                    href: href,
                    title: title,
                    'data-id': docData.id,
                    'data-linktype': 'document'
                };
            }
        });

        tinymce.PluginManager.add('wagtaildoclink', DocLinkPlugin);
    })(jQuery);

}).call(this);
