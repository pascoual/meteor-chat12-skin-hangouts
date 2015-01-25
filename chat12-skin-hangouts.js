Template.chatContainer.rendered = function () {
  this.$(".chat-box").scrollTop(this.$(".chat-box").height() + 100);
}

Template.chatContainer.events({
  'click .buttonMinimize': function (event, tmpl) {
    tmpl.$(".setting").toggle(300);
    tmpl.$(".chat-box").toggle(300);
    tmpl.$(".messagebox").toggle(300);
  },
  'click .buttonClose': function (event,tmpl) {
    tmpl.$("chat-container").remove();
  },
  /*
   * Try to get chat-container resizable via mouse :
   * http://mark-story.com/posts/view/making-elements-drag-resizable-with-javascript
   * http://webfx.eae.net/dhtml/genresize/genresize.html
   * http://www.w3schools.com/cssref/tryit.asp?filename=trycss3_resize
   */
});
