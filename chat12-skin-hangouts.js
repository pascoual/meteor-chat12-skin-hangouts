/**
 * Global templates helpers
 */
Template.registerHelper("chat12GetContactName", function (user) {
  if (typeof user === "string")
    user = Meteor.users.findOne({_id: user}); 
  return Chat12.getContactName(user);
});
Template.registerHelper("chat12GetContactAvatar", function (user) {
  if (typeof user === "string")
    user = Meteor.users.findOne({_id: user}); 
  return Chat12.getContactAvatar(user);
});
Template.registerHelper("chat12GetUnreadNumber", function () {
  return 0;
});
Template.registerHelper("chat12Itsme", function (user) {
  if (typeof user === "string")
    return Meteor.userId() === user;
  return Meteor.userId() === user._id;
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
Template.chatContainer.created = function () {
  // subscribe
  this.subscriptions = [Meteor.subscribe("chat12GetMessages", this.data._id)];
};
Template.chatContainer.rendered = function () {
  //this.$(".chat-box").scrollTop(this.$(".chat-box").height() + 100);
}
Template.chatContainer.destroyed = function () {
  // unsubscribe
  this.subscriptions.forEach(function (subscription) {subscription.stop()});
};

Template.chatContainer.events({
  'click .buttonMinimize': function (event, tmpl) {
    tmpl.$(".setting").toggle(300);
    tmpl.$(".chat-box").toggle(300).scrollTop(4000000);
    tmpl.$(".messagebox").toggle(300);
  },
  'click .buttonClose': function (event,tmpl) {
    tmpl.$(".chat-container").remove();
  },
  'submit .chat12MessageSendForm': function (event, tmpl) {
    event.stopImmediatePropagation();
    event.preventDefault();
    Chat12.Chat121Send(tmpl.data._id, tmpl.$('.chat12MessageInput').val());
    tmpl.$('.chat12MessageInput').val('');
  },
  'focus .chat12MessageInput': function (event, tmpl) {
    Chat12.Chat121SetRead(tmpl.data._id);
  }
  /*
   * Try to get chat-container resizable via mouse :
   * http://mark-story.com/posts/view/making-elements-drag-resizable-with-javascript
   * http://webfx.eae.net/dhtml/genresize/genresize.html
   * http://www.w3schools.com/cssref/tryit.asp?filename=trycss3_resize
   */
});

Template.chatContainer.helpers({
  getContact: function (id) {
    return Meteor.users.findOne({_id: id});
  },
  hasUnreadMsg: function () {
    return Chat12.Chat121Msgs.find({
      from: this._id,
      to: Meteor.userId(),
      readBy: {$nin: [Meteor.userId()]}
    }).count() > 0;
  },
  getMessages: function (event, tmpl) {
    return Chat12.Chat121Msgs.find({
      $or: [{
        from: Meteor.userId(),
        to: this._id
      }, {
        from: this._id,
        to: Meteor.userId()
      }]
    }, {sort: {date: 1}});
  }
});

/**
 * chatMessage
 */ 
Template.chatMessage.rendered = function () {
  this.$('li').parent('ol').scrollTop(4000000);
}
