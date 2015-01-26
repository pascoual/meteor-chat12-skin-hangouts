/**
 * Global templates helpers
 */
Template.registerHelper("chat12GetContactName", function (user) {
  return Chat12.getContactName(user);
});
Template.registerHelper("chat12GetContactAvatar", function (user) {
  return Chat12.getContactAvatar(user);
});
Template.registerHelper("chat12GetUnreadNumber", function () {
  return 0;
});

/**
 * chatContactList
 */
Template.chatContactList.helpers({
  getContacts: function (event, tmpl) {
    var sort = {};
    sort[Chat12.getContactOrderField()] = 1;
    return Meteor.users.find({_id: {$in: Chat12.getContacts(this.userId)}}, {sort: sort});
  },
  getListClass: function (event, tmpl) { return Chat12.getContactsListClass()}
});

/**
 * chatContactList
 */
Template.chat12Contact.events({
  'click li': function (event, tmpl) {
    Blaze.renderWithData(Template.chatContainer, tmpl.data, document.getElementById("chat12Zone"));
  }
});

/**
 * chatZoneBottom
 */
Template.chatZoneBottom.created = function () {
  // subscribe
  this.subscriptions = [Meteor.subscribe("chat12GetOnes")];
};

Template.chatZoneBottom.destroyed = function () {
  // unsubscribe
  this.subscriptions.forEach(function (subscription) {subscription.stop()});
};

/**
 * chatContainer
 */
Template.chatContainer.rendered = function () {
  this.$(".chat-box").scrollTop(this.$(".chat-box").height() + 100);
}

Template.chatContainer.events({
  'click .buttonMinimize': function (event, tmpl) {
    /*if (parseInt(tmpl.$(".chat-container .top-header").css('margin-top')) > 0)
      tmpl.$(".chat-container .top-header").animate({"margin-top": 0}, 300);
    else {
      var height = tmpl.$(".chat-container").height() - tmpl.$(".top-header").height();
      tmpl.$(".chat-container .top-header").animate({"margin-top": height}, 300);
    }*/
    tmpl.$(".setting").toggle(300);
    tmpl.$(".chat-box").toggle(300);
    tmpl.$(".messagebox").toggle(300);
  },
  'click .buttonClose': function (event,tmpl) {
    tmpl.$(".chat-container").remove();
  },
  /*
   * Try to get chat-container resizable via mouse :
   * http://mark-story.com/posts/view/making-elements-drag-resizable-with-javascript
   * http://webfx.eae.net/dhtml/genresize/genresize.html
   * http://www.w3schools.com/cssref/tryit.asp?filename=trycss3_resize
   */
});
