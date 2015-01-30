/**
 * Global templates helpers
 */
Template.registerHelper("chat12GetContactName", function (user) {
  if (typeof user === "string")
    user = Meteor.users.findOne({_id: user}); 
  return Chat12.getContactName(user);
});
Template.registerHelper("chat12GetContactPortrait", function (user) {
  if (typeof user === "string")
    user = Meteor.users.findOne({_id: user});
  return Chat12.getContactPortrait(user);
});
Template.registerHelper("chat12GetRoomPortrait", function (room) {
  return Chat12.getRoomPortrait(room);
});
Template.registerHelper("chat12GetContactDescription", function (user) {
  if (typeof user === "string")
    user = Meteor.users.findOne({_id: user});
  return Chat12.getContactDescription(user);
});
Template.registerHelper("chat12GetUnreadNumber", function (from) {
  from = from ? {from: from} : {};
  return Chat12.Chat121Msgs.find(_.extend({to: Meteor.userId(), readBy: {$nin: [Meteor.userId()]}}, from)).count();
});
Template.registerHelper("chat12Itsme", function (user) {
  if (typeof user === "string")
    return Meteor.userId() === user;
  return Meteor.userId() === user._id;
});

/**
 * Global tools
 */
Chat12.createChatContainer = function (to) {
  if (typeof to === "string")
    to = Meteor.users.findOne({_id: to});
  if ($('#chat-container-' + to._id).length === 0)
    Chat12.openedViews[to._id] = Blaze.renderWithData(Template.chatContainer, to, document.getElementById("chat12Zone"));
}

/**
 * Array/Json of chat view opened
 */
Chat12.openedViews = {};

/**
 * chatContactList
 */
Template.chatContactList.helpers({
  getContacts: function (event, tmpl) {
    return Meteor.users.find({_id: {$in: Chat12.getContacts(this.userId)}}, {sort: Chat12.getContactOrder()});
  },
  getRooms: function (event, tmpl) {
    return Chat12.Chat12Rooms.find({participants: {$in: [Meteor.userId()]}}, {sort: {name: 1}});
  },
  getListClass: function (event, tmpl) { return Chat12.getContactsListClass()}
});

Template.chatContactList.events({
  'click .chat12CreateRoomButton': function (event, tmpl) {
    $("#chat12RoomCreationOverlay").removeClass("hide");
  }
});

/**
 * chatContactList
 */
Template.chat12Contact.events({
  'click li': function (event, tmpl) {
    Chat12.createChatContainer(tmpl.data);
  }
});

/**
 * chatZoneBottom
 */
Template.chatZoneBottom.created = function () {
  // subscribe
  this.subscriptions = [
    Meteor.subscribe("chat12GetOnes"),
    Meteor.subscribe("chat12GetUnreadMessages")
  ];
  Chat12.Chat121Msgs.find({
    to: Meteor.userId(),
    readBy: {$nin: [Meteor.userId()]}
  }).observe({
    added: function (doc) {
      // if chat div for doc.from does not exist => create it !
      Chat12.createChatContainer(doc.from);
    }
  });
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
    //tmpl.$(".setting").toggle(300);
    tmpl.$(".chat-box").toggle(300).scrollTop(4000000);
    tmpl.$(".messagebox").toggle(300);
  },
  'click .buttonClose': function (event,tmpl) {
    //tmpl.$(".chat-container").remove();
    //UI.DomBackend.removeElement("#chat-container-" + tmpl.data._id);
    Blaze.remove(Chat12.openedViews[tmpl.data._id]);
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
