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
  return Chat12.Chat121Msgs.find(_.extend({to: Meteor.userId(), readBy: {$nin: [Meteor.userId()]}, removed: {$ne: true}}, from)).count();
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
  var contactOrRoom = to;
  if (typeof to === "string") {
    contactOrRoom = Meteor.users.findOne({_id: to});
    // if it's a Room
    if (typeof contactOrRoom === "undefined")
      contactOrRoom = Chat12.Chat12Rooms.findOne({_id: to});
  }
  if ($('#chat-container-' + contactOrRoom._id).length === 0)
    Chat12.openedViews[contactOrRoom._id] = Blaze.renderWithData(Template.chatContainer, contactOrRoom, document.getElementById("chat12Zone"));
}

Chat12.setReadIfChatInputFocused = function (msg, chatContainer) {
  //if ($('#chat-container-' +  chatContainer + ' input:focus').length === 1) {
  if ($(document.activeElement).parents('#chat-container-' + chatContainer).length === 1) {
    var setReadMethode = Chat12.Chat121SetRead;
    if (msg.room)
      setReadMethode = Chat12.Chat12RoomSetRead;
    setReadMethode(chatContainer);
  }
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
 * chatRoomList
 */
Template.chat12RoomContact.events({
  'click li': function (event, tmpl) {
    Chat12.createChatContainer(tmpl.data);
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
  Tracker.autorun(function () {
    this.subscriptions = [
      Meteor.subscribe("chat12GetOnes"),
      // add not needed argument to recompute subscription in case of new user
      Meteor.subscribe("chat12GetUnreadMessages", Meteor.users.find().count()),
      Meteor.subscribe("chat12GetRooms"),
      // add not needed argument to recompute subsciption in case of new room
      Meteor.subscribe("chat12GetRoomUnreadMessages", Chat12.Chat12Rooms.find().count())
    ];
    Chat12.Chat121Msgs.find({
      to: Meteor.userId(),
      readBy: {$nin: [Meteor.userId()]}
    }).observe({
      added: function (doc) {
        // if chat div for doc.from does not exist => create it !
        Chat12.createChatContainer(doc.from);
        // set as read if input for this chat is focused
        Chat12.setReadIfChatInputFocused(doc, doc.from);
        // call site callback
        Chat12.onMsgCallBack(doc, Meteor.users.findOne({_id: doc.from}));
      }
    });
    Chat12.Chat12RoomMsgs.find({
      //room: {$in: Chat12.getRooms(Meteor.userId())},
      readBy: {$nin: [Meteor.userId()]}
    }).observe({
      added: function (doc) {
        // if chat div for doc.from does not exist => create it !
        Chat12.createChatContainer(doc.room);
        // set as read if input for this chat is focused
        Chat12.setReadIfChatInputFocused(doc, doc.room);
        // call site callback
        Chat12.onMsgCallBack(doc, Chat12.Chat12Rooms.findOne({_id: doc.room}));
      }
    });
  });
};

Template.chatZoneBottom.destroyed = function () {
  // unsubscribe
  if (this.subscriptions)
    this.subscriptions.forEach(function (subscription) {subscription.stop()});
};

/* remove create room modal when created */
AutoForm.hooks({
  insertChat12RoomForm: {
    onSuccess: function(operation, result, template) {
      $("#chat12RoomCreationOverlay").addClass("hide");
    }
  }
});

/**
 * chatContainer
 */
Template.chatContainer.created = function () {
  // subscribe
  // it's a room
  var publishName = null;
  if (this.data.participants)
    publishName = "chat12GetRoomMessages";
  else
    publishName = "chat12GetMessages";
  this.subscriptions = [Meteor.subscribe(publishName, this.data._id)];
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
    tmpl.$(".chat-box").toggle(300).scrollTop(4000000).delay(500).scrollTop(4000000);
    tmpl.$(".messagebox").toggle(300);
    event.stopImmediatePropagation();
  },
  'click .buttonClose': function (event,tmpl) {
    //tmpl.$(".chat-container").remove();
    //UI.DomBackend.removeElement("#chat-container-" + tmpl.data._id);
    Blaze.remove(Chat12.openedViews[tmpl.data._id]);
    event.stopImmediatePropagation();
  },
  'submit .chat12MessageSendForm': function (event, tmpl) {
    event.stopImmediatePropagation();
    event.preventDefault();
    // default: 121
    var sendMethode = Chat12.Chat121Send;
    // if it's a room
    if (tmpl.data.participants)
      sendMethode = Chat12.Chat12RoomSend;
    sendMethode(tmpl.data._id, tmpl.$('.chat12MessageInput').val());
    tmpl.$('.chat12MessageInput').val('');
    event.stopImmediatePropagation();
  },
  'focus .chat12MessageInput': function (event, tmpl) {
    var setReadMethode = Chat12.Chat121SetRead;
    if (tmpl.data.participants)
      setReadMethode = Chat12.Chat12RoomSetRead;
    setReadMethode(tmpl.data._id);
    event.stopImmediatePropagation();
  },
  'click': function (event, tmpl) {
    //console.log('hooooooo');
    tmpl.$('.chat12MessageInput').focus();
  },
  'click .chat12MessageInput': function (e, tmpl) {
    tmpl.$('li').parent('ol').scrollTop(4000000);
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
    // it' a Room
    if (this.participants)
      return this;
    // It's a contact
    return Meteor.users.findOne({_id: id});
  },
  hasUnreadMsg: function () {
    // it's a Room
    if (this.participants)
      return Chat12.Chat12RoomMsgs.find({
        room: this._id,
        readBy: {$nin: [Meteor.userId()]}
      }).count() > 0;
    // It's a contact
    return Chat12.Chat121Msgs.find({
      from: this._id,
      to: Meteor.userId(),
      readBy: {$nin: [Meteor.userId()]}
    }).count() > 0;
  },
  getMessages: function (event, tmpl) {
    // it's a Room
    if (this.participants)
      return Chat12.Chat12RoomMsgs.find({
        room: this._id,
      }, {sort: {date: 1}});
    // it's a contact
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
  Meteor.setTimeout(function () {
    this.$('li').parent('ol').scrollTop(4000000);
  }, 500);
}
Template.chatMessage.helpers({
  unread: function () {
    if (this.readBy)
      return this.readBy.length === 0;
  },
  iHaveNotReadIt: function () {
    if (this.readBy)
      if (this.readBy.indexOf(Meteor.userId()) === -1)
        return true;
    return false;
  }
});
