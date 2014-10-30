/**
    @fileOverview

    @toc

    */

'use strict';

angular.module('angular-xmppauth', [])
  .factory('XmppAuth', ['$rootScope', '$timeout',
    function($rootScope, $timeout) {
      var xmppBasePath = 'http://localhost:5280/http-bind';
      var connection = new Strophe.Connection(xmppBasePath);
      $rootScope.messages = [];

      // handle incoming messages
      var onMessage = function(msg) {
        var to = msg.getAttribute('to');
        var from = msg.getAttribute('from');
        var type = msg.getAttribute('type');
        var elems = msg.getElementsByTagName('body');
        var body = elems[0];
        $rootScope.messages.push({
          sender: from,
          chat: Strophe.getText(body),
          side: 'right'
        });
        $rootScope.$broadcast('new-message');
        $ionicScrollDelegate.scrollBottom(true);
        return true;
      };

      var on_presence = function(presence) {

        // handle presence
        return true

      };


      var loginHandler = function(status) {
        if (status == Strophe.Status.CONNECTING) {
          console.log('Strophe is connecting');
        } else if (status == Strophe.Status.CONNFAIL) {
          console.log('Strophe failed to connect');
        } else if (status == Strophe.Status.AUTHFAIL) {
          console.log("Invalid User CredDentials, Try Signup");
          $rootScope.$broadcast('user404');
          return;
        } else if (status == Strophe.Status.DISCONNECTING) {
          console.log('Strophe disconnected');
        } else if (status == Strophe.Status.DISCONNECTED) {
          console.log('Strophe is disconnected');
        } else if (status == Strophe.Status.CONNECTED) {
          console.log('Strophe Connected');
          connection.addHandler(on_presence, null, "presence");
          connection.addHandler(onMessage, null, 'message', null, null,
            null);
          connection.send($pres().tree());

        }
      };
      return {
        signup: function(jid, password) {
          // Signup requires strophejs.register plugin
          connection.register.connect("localhost", function(status) {
            if (Strophe.Status.REGISTER === Strophe.Status.REGISTER) {
              // calling submit will continue the registration process
              console.log("registration of user in process");
              connection.register.fields.username = jid;
              connection.register.fields.password = password;
              connection.register.submit();
              console.log(status);
              $timeout(function() {
                $rootScope.$broadcast('user201');
                return;
              }, 3500);
            } else if (status === Strophe.Status.REGISTERED) {
              console.log("registered!");
              //alert('registered');
              // calling login will authenticate the registered JID.
              $rootScope.$broadcast('user201');
              connection.authenticate();
              connection.addHandler(on_presence, null, "presence");
              connection.connect(jid + '@localhost', password, loginHandler);
              return;
            } else if (status === Strophe.Status.CONFLICT) {
              console.log("Contact already existed!");
              connection.authenticate();
              connection.addHandler(on_presence, null, "presence");
              connection.connect(jid + '@localhost', password, loginHandler);
            } else if (status === Strophe.Status.NOTACCEPTABLE) {
              console.log("Registration form not properly filled out.")
            } else if (status === Strophe.Status.REGIFAIL) {
              console.log("The Server does not support In-Band Registration")
            } else if (status === Strophe.Status.CONNECTED) {
              // do something after successful authentication
              connection.addHandler(on_presence, null, "presence");
              //loginHandler(jid+'@localhost', password);
              //connection.addHandler(onMessage, null, 'message', null, null,
              //null);
              //connection.send($pres().tree());
            } else {
              // Do other stuff
              console.log(status);
            }
          });
        },
        auth: function(login, password) {
          //alert("trying to login");
          connection.connect(login, password, loginHandler);
        },
        sendMessage: function(userid, to_jid, text_message) {
          if (text_message.length > 0) {
            var connect_jid = to_jid;
            var timestamp = new Date().getTime();
            var to_jid = Strophe.getBareJidFromJid(connect_jid);
            var message = $msg({
              from: userid,
              to: to_jid,
              id: timestamp
            }).c('body').t(text_message).up().c('active', {
              'xmlns': 'http://jabber.org/protocol/chatstates'
            });
            connection.send(message);
            //console.log(message);
          }
        },
        connection: connection
      };
    }
  ]);
