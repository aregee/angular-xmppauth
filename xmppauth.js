/**
@fileOverview

@toc

*/

'use strict';

angular.module('angular-xmppauth', [])
    .factory('XmppAuth', [function() {

        var connection = new Strophe.Connection('http://localhost:5280/http-bind');
        return {

            auth: function(login, password) {
                connection.connect(login, password, function(status) {
                    if (status == Strophe.Status.CONNECTING) {
                        console.log('Strophe is connecting');
                    } else if (status == Strophe.Status.CONNFAIL) {
                        console.log('Strophe failed to connect');
                    } else if (status == Strophe.Status.DISCONNECTING) {
                        console.log('Strophe disconnected');
                    } else if (status == Strophe.Status.DISCONNECTED) {
                        console.log('Strophe is disconnected');
                    } else if (status == Strophe.Status.CONNECTED) {
                        console.log('Strophe Connected');
                        connection.send($pres().tree());
                    }
                });
            },
            sendMessage: function(userid, text_message) {
                if (text_message.length > 0) {
                    var connect_jid = 'user2@localhost';
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
                }
            },
            connection: connection
        };
    }]);