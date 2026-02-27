const { Editor } = require('@tiptap/core');
const StarterKit = require('@tiptap/starter-kit');
const editor = new Editor({
  extensions: [StarterKit],
  content: '<p><strong>Hello</strong></p>',
});
editor.commands.selectAll();
console.log(editor.isActive('bold'));
