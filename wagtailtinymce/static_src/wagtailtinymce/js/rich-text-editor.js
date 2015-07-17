'use strict';

var mcePlugins = ['hr', 'wagtaillink'],
    mceButtons = [
        'undo redo | styleselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link'
        ],
    mceOptions = {};

function registerMCEPlugin(name) {
    mcePlugins.push(name);
}

function registerMCEButton(name, row) {
    if (row === undefined) {
        row = 0;
    }
    mceButtons[row] += ' ' + (name);
}

function setMCEOption(name, value) {
    mceOptions[name] = value;
}


function makeRichTextEditable(id, options) {

    options = options || {};
    $.extend(options, mceOptions);
    $.extend(options, {
        selector:'#' + id.toString(),
        plugins: mcePlugins,
        toolbar: mceButtons
        });

    tinymce.init(options);
}
