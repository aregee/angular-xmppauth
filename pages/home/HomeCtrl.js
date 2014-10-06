/**
 */

'use strict';

angular.module('myApp')
.controller('HomeCtrl', ['$scope', 'XmppAuth', '$rootScope', '$timeout', '$http',
    function($scope, XmppAuth, $rootScope, $timeout, $http) {

        $scope.initialLogin = function(username, password) {
            XmppAuth.auth(username, password);
        };
        $scope.initialLogin('user1@localhost', 'notebook');
        $scope.chatMsg = {};
        $scope.error = true;
        $scope.message = [];
        $scope.chatMsg.sender = 'user1@localhost';

        $scope.sendChat = function() {
            if ($scope.chatMsg.msg === undefined) {
                $scope.error = true;
                $scope.errMsg = "Palooka, you ain;t sending me blank text";
                return;
            };
            $scope.chatMsg.sender = 'user1@localhost';
            $scope.message.push({
                sender: $scope.chatMsg.sender,
                chat: $scope.chatMsg.msg,
                side: 'right'
            });
            //$scope.$apply();
            xmppAuth.sendMessage($scope.chatMsg.sender, $scope.chatMsg.msg);
            $scope.chatMsg = {};
        };

        $scope.sender = 'user2@localhost';
        var onMessage = function(msg) {
            var to = msg.getAttribute('to');
            var from = msg.getAttribute('from');
            var type = msg.getAttribute('type');
            var elems = msg.getElementsByTagName('body');
            if (type == "chat" && elems.length > 0) {
                var body = elems[0];
                var reply = $msg({
                        to: from,
                        from: to,
                        type: 'chat'
                    })
                    .c("body").t("pong");
                console.log(from + ': ' + Strophe.getText(body));
                //alert(Strophe.getText(body));
                $scope.sender = from;
                $scope.message.push({
                    sender: from,
                    chat: Strophe.getText(body),
                    side: 'left'
                });
                $scope.$apply();
            }
            return true;
        };

        XmppAuth.connection.addHandler(onMessage, null, 'message', null, null,
            null);
        XmppAuth.connection.send($pres().tree());
    }
]);