'use strict';

var mcePlugins = ['hr', 'wagtaillink'],
    mceButtons = [
        'undo redo | styleselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link'
        ];

function registerMCEPlugin(name) {
    mcePlugins.push(name);
}

function registerMCEButton(name, row) {
    if (row === undefined) {
        row = 0;
    }
    mceButtons[row] += ' ' + (name);
}


function makeRichTextEditable(id) {

    tinymce.init({
        selector:'#' + id.toString(),
        plugins: mcePlugins,
        toolbar: mceButtons
        });
}
