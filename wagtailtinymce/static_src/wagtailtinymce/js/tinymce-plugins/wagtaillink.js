(function() {
    (function($) {
        tinymce.PluginManager.requireLangPack('wagtaillink', mceOptions.language);
        tinymce.PluginManager.add('wagtaillink', function(editor) {
            var getEnclosingLink = function() {
                var node;

                node = editor.selection.commonAncestorContainer;
                return $(node).parents('a').get(0);
            };

            function showDialog() {
                var button;

                var enclosingLink, lastSelection, url;

                enclosingLink = getEnclosingLink();
                if (enclosingLink) {
                    // unlink
                    editor.execCommand('unlink');
                } else {
                    lastSelection = editor.selection;
                    if (lastSelection.getRng().collapsed) {
                        url = window.chooserUrls.pageChooser + '?allow_external_link=true&allow_email_link=true&prompt_for_link_text=true';
                    } else {
                        url = window.chooserUrls.pageChooser + '?allow_external_link=true&allow_email_link=true';
                    }

                    function isOnlyTextSelected(anchorElm) {
                        var html = lastSelection.getContent();

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

                    selectedElm = lastSelection.getNode();
                    anchorElm = editor.dom.getParent(selectedElm, 'a[href]');
                    onlyText = isOnlyTextSelected(anchorElm);
                    text = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : lastSelection.getContent({format: 'text'});
                    href = anchorElm ? editor.dom.getAttrib(anchorElm, 'href') : '';

                    ModalWorkflow({
                        url: url,
                        responses: {
                            pageChosen: function(pageData) {
                                var a;

                                href = pageData.url;

                                // Delay confirm since onSubmit will move focus
                                function delayedConfirm(message, callback) {
                                    var rng = editor.selection.getRng();

                                    window.setTimeout(function() {
                                        editor.windowManager.confirm(message, function(state) {
                                            editor.selection.setRng(rng);
                                            callback(state);
                                        });
                                    }, 0);
                                }

                                function insertLink() {
                                    var linkAttrs = {
                                        href: href,
                                        title: (
                                            pageData.title
                                                ? (pageData.title === href && text.length ? text : pageData.title)
                                                : text
                                            )
                                    };

                                    if (anchorElm) {
                                        editor.focus();

                                        editor.dom.setAttribs(anchorElm, linkAttrs);
                                        editor.dom.setHTML(anchorElm, editor.dom.encode(linkAttrs.title));

                                        editor.selection.setNode(anchorElm);
                                        editor.undoManager.add();
                                    } else {
                                        if (onlyText) {
                                            editor.insertContent(editor.dom.createHTML('a', linkAttrs, editor.dom.encode(linkAttrs.title)));
                                        } else {
                                            editor.execCommand('mceInsertLink', false, linkAttrs);
                                        }
                                    }
                                }

                                if (!href) {
                                    editor.execCommand('unlink');
                                    return;
                                }

                                // Is email and not //user@domain.com
                                if (href.indexOf('@') > 0 && href.indexOf('//') == -1 && href.indexOf('mailto:') == -1) {
                                    delayedConfirm(
                                        'The URL you entered seems to be an email address. Do you want to add the required mailto: prefix?',
                                        function(state) {
                                            if (state) {
                                                href = 'mailto:' + href;
                                            }

                                            insertLink();
                                        }
                                    );

                                    return;
                                }

                                // Is not protocol prefixed
                                if ((editor.settings.link_assume_external_targets && !/^\w+:/i.test(href)) ||
                                    (!editor.settings.link_assume_external_targets && /^\s*www\./i.test(href))) {
                                    delayedConfirm(
                                        'The URL you entered seems to be an external link. Do you want to add the required http:// prefix?',
                                        function(state) {
                                            if (state) {
                                                href = 'http://' + href;
                                            }

                                            insertLink();
                                        }
                                    );

                                    return;
                                }

                                insertLink();
                            }
                        }
                    });
                }
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
                stateSelector: 'a[data-linktype=page],a[href]:not([data-linktype])'
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
