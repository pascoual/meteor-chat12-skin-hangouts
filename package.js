Package.describe({
  summary: "Chat12 Hangouts Skin. Client only package.",
  version: "0.1.0",
  git: "https://github.com/pascoual/meteor-chat12"
});

Package.on_use(function (api) {
  api.versionsFrom('METEOR@1.0');

  api.use(['livedata', 'deps', 'templating', 'ui', 'blaze', 'ejson', 'reactive-var','jquery','raix:handlebar-helpers','fortawesome:fontawesome','mizzao:user-status','pascoual:chat12'], 'client');

  api.imply('pascoual:chat12');
  api.imply('mizzao:user-status')

  api.add_files(['chat12-skin-hangouts.css', 'chat12-skin-hangouts.html', 'chat12-skin-hangouts.js'], 'client');
});
