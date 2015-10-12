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

    function getEnclosingLink(editor) {
        var node;

        node = editor.selection.getNode();
        return node.tagName === 'A' ? node : $(node).parents('a').get(0);
    }

    function isOnlyTextSelected(anchorElm, selection) {
        var html = selection.getContent();

        // Partial html and not a fully selected anchor element
        if (/</.test(html) && (!/^<a [^>]+>[^<]+<\/a>$/.test(html) || html.indexOf('href=') == -1)) {
            return false;
        }

        if (anchorElm) {
            var nodes = anchorElm.childNodes, i;

            if (nodes.length === 0) {
                return false;
            }

            for (i = nodes.length - 1; i >= 0; i--) {
                if (nodes[i].nodeType != 3) {
                    return false;
                }
            }
        }

        return true;
    }

    // Delay confirm since onSubmit will move focus
    function delayedConfirm(editor, message, callback) {
        var rng = editor.selection.getRng();

        window.setTimeout(function() {
            editor.windowManager.confirm(message, function(state) {
                editor.selection.setRng(rng);
                callback(state);
            });
        }, 0);
    }

    function LinkPlugin(editor) {
        this.editor = editor;
        this.hook();
    }

    $.extend(LinkPlugin.prototype, {
        responseType: 'pageChosen',
        hook: function () {
            var editor = this.editor, self = this;
            editor.addButton('link', {
                icon: 'link',
                tooltip: 'Insert/edit link',
                shortcut: 'Meta+K',
                onclick: function() { return self.showDialog(); },
                stateSelector: 'a[data-linktype=page],a[href]:not([data-linktype])'
            });

            editor.addButton('unlink', {
                icon: 'unlink',
                tooltip: 'Remove link',
                cmd: 'unlink',
                stateSelector: 'a[data-linktype=page],a[href]:not([data-linktype])'
            });

            editor.addMenuItem('link', {
                icon: 'link',
                text: 'Insert/edit link',
                shortcut: 'Meta+K',
                onclick: function() { return self.showDialog(); },
                stateSelector: 'a[data-linktype=page],a[href]:not([data-linktype])',
                context: 'insert',
                prependToContext: true
            });

            editor.addShortcut('Meta+K', '', function() { return self.showDialog(); });
            editor.addCommand('mceLink', function() { return self.showDialog(); });
        },
        getChooserUrl: function () {
            var lastSelection = this.editor.selection;
            if (lastSelection.getRng().collapsed) {
                url = window.chooserUrls.pageChooser + '?allow_external_link=true&allow_email_link=true&prompt_for_link_text=true';
            } else {
                url = window.chooserUrls.pageChooser + '?allow_external_link=true&allow_email_link=true';
            }
            return url;
        },
        showDialog: function () {
            var button, enclosingLink, lastSelection, url, href, text, anchorElm, selectedElm,
                self=this, editor=this.editor,
                responseHandlers = {};

            responseHandlers[self.responseType] = function(pageData) {
                return self.itemChosen(editor, anchorElm, text, pageData);
            };
            lastSelection = editor.selection;
            enclosingLink = getEnclosingLink(editor);
            if (enclosingLink) {
                // unlink
                editor.execCommand('unlink');
            } else {
                url = this.getChooserUrl();

                selectedElm = lastSelection.getNode();
                anchorElm = editor.dom.getParent(selectedElm, 'a[href]');
                text = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : lastSelection.getContent({format: 'text'});
                href = anchorElm ? editor.dom.getAttrib(anchorElm, 'href') : '';

                ModalWorkflow({
                    url: url,
                    responses: responseHandlers
                });
            }
        },
        getLinkAttrs: function (pageData, text) {
            var href = pageData.url,
                title = (
                    pageData.title
                    ? (pageData.title === href && text.length ? text : pageData.title)
                    : text
                );
            var attrs = {
                href: href,
                title: title
            };
            if (pageData.id) {
                attrs['data-id'] = pageData.id;
                attrs['data-linktype'] = 'page';
            }
            return attrs;
        },
        itemChosen: function (editor, anchorElm, text, pageData) {
            var a,
                linkAttrs = this.getLinkAttrs(pageData, text),
                href = linkAttrs.href,
                self = this;

            if (!href) {
                editor.execCommand('unlink');
                return;
            }

            // Is email and not //user@domain.com
            if (href.indexOf('@') > 0 && href.indexOf('//') == -1 && href.indexOf('mailto:') == -1) {
                delayedConfirm(
                    editor,
                    'The URL you entered seems to be an email address. Do you want to add the required mailto: prefix?',
                    function(state) {
                        if (state) {
                            linkAttrs.href = 'mailto:' + linkAttrs.href;
                        }

                        self.insertLink(editor, anchorElm, linkAttrs);
                    }
                );

                return;
            }

            // Is not protocol prefixed
            if ((editor.settings.link_assume_external_targets && !/^\w+:/i.test(href)) ||
                (!editor.settings.link_assume_external_targets && /^\s*www\./i.test(href))) {
                delayedConfirm(
                    editor,
                    'The URL you entered seems to be an external link. Do you want to add the required http:// prefix?',
                    function(state) {
                        if (state) {
                            linkAttrs.href = 'http://' + linkAttrs.href;
                        }

                        self.insertLink(editor, anchorElm, linkAttrs);
                    }
                );

                return;
            }

            this.insertLink(editor, anchorElm, linkAttrs);
        },
        insertLink: function (editor, anchorElm, linkAttrs) {
            if (anchorElm) {
                editor.focus();

                editor.dom.setAttribs(anchorElm, linkAttrs);
                editor.dom.setHTML(anchorElm, editor.dom.encode(linkAttrs.title));

                editor.selection.setNode(anchorElm);
                editor.undoManager.add();
            } else {
                if (isOnlyTextSelected(anchorElm, editor.selection)) {
                    editor.insertContent(editor.dom.createHTML('a', linkAttrs, editor.dom.encode(linkAttrs.title)));
                } else {
                    editor.execCommand('mceInsertLink', false, linkAttrs);
                }
            }
        }
    });

    (function($) {
        tinymce.PluginManager.requireLangPack('wagtaillink', mceOptions.language);
        tinymce.PluginManager.add('wagtaillink', LinkPlugin);
    })(jQuery);

}).call(this);
