(function () {
    'use strict';

    angular
        .module('Core')
        .factory('opentok', opentok);

    opentok.$inject = [
        '$q'
    ];

    function opentok($q) {
        var apiKey = "45716652";
        var sessionId = null;
        var token = null;
        var session, publisher, chatCallbackFn;

        return {
            startOpentokCall: _startOpentokCall,
            postMessage: _postMessage,
            disconnect: _disconnect
        };

        function _startOpentokCall(type, callbackFn, OTSessionInfo) {
            sessionId = OTSessionInfo.sessionId;
            token = OTSessionInfo.token;

            if (type === 'chat') {
                return _startChat(callbackFn);
            } else if (type === 'video') {
                return _startVideoCall();
            } else {
                return _startAudioCall();
            }

            function _startVideoCall() {
                return _initializeSession().then(_connectSession)
                    .then(_publishVideoStream);
            }

            function _startAudioCall() {
                return _initializeSession().then(_connectSession)
                    .then(_publishAudioStream);
            }

            function _startChat(callbackFn) {
                chatCallbackFn = callbackFn;
                return _initializeSession(true).then(_connectSession);
            }

            function _initializeSession(registerOnSignalReceiver) {
                var deferred = $q.defer();
                session = TB.initSession(apiKey, sessionId)
                    .on('streamCreated', onStreamCreated)
                    .on('streamDestroyed', onStreamDestroyed)
                    .on('connectionDestroyed', onConnectionDestroyed)
                    .on('connectionCreated', onConnectionCreated);

                if (registerOnSignalReceiver) {
                    session.on('signal', onSignalReceived);
                }

                deferred.resolve();
                return deferred.promise;

                function onStreamCreated(event) {
                    if (event.stream.connection.connectionId === session.connection.connectionId) {
                        return;
                    }

                    var div = document.createElement('div');
                    div.setAttribute('id', 'stream' + event.stream.streamId);
                    div.setAttribute('class', 'subscriber');                    
                    div.setAttribute('style', 'height:200px !important;width:200px !important;background-color:rgba(0,0,0,0)!important;');            
                    document.getElementById("subscriberWrapper").appendChild(div);
        
                    var options = { width: '100%', height: '100%' };
                    session.subscribe(event.stream, div.id, options);
                    console.log('onStreamCreated', 'New stream subscribed');
                }

                function onStreamDestroyed(event) {
                    session.unsubscribe(event.stream);
                    console.log('onStreamDestroyed', 'Stream unsubscribe');
                }

                function onConnectionDestroyed(event) {
                    console.log('onConnectionDestroyed', event);
                    console.log('onConnectionDestroyed', 'Subscribed user has left the session');
                }

                function onConnectionCreated(event) {
                    console.log('onConnectionCreated', 'New user joined the session: ' + event);
                }

                function onSignalReceived(event) {
                    if (session.connection.connectionId === event.from.connectionId) {
                        event.self = true;
                    }
                    else {
                        event.self = false;
                    }
                    chatCallbackFn(event);
                }
            }

            function _connectSession() {
                var deferred = $q.defer();
                session.connect(token, function (error) {
                    if (error) {
                        deferred.reject(error.message);
                        console.log('_connectSession', 'Cannot connect to the OpenTok session' + error.message);
                    }
                    else {
                        deferred.resolve(event);
                        console.log('_connectSession', 'Connected to the OpenTok session');
                    }
                });
                return deferred.promise;
            }

            function _publishVideoStream() {
                return _publishStream({
                    publishAudio: true,
                    publishVideo: true,
                    width: '100%',
                    height: '100%'
                });
            }

            function _publishAudioStream() {
                return _publishStream({
                    publishAudio: true,
                    publishVideo: false
                });
            }

            function _publishStream(option) {
                var deferred = $q.defer();
                _initializePublisher(option);

                session.publish(publisher, function (error) {
                    if (error) {
                        deferred.reject(error.message);
                    } else {
                        deferred.resolve();
                        console.log('_publishStream', 'Stream succesfully published');
                    }
                });
                return deferred.promise;

                function _initializePublisher(options) {
                    var div = document.createElement('div');
                    div.setAttribute('id', 'publisher');                    
                    div.setAttribute('style', 'height:200px !important;width:200px !important;background-color:rgba(0,0,0,0)!important;');            
                    document.getElementById("publisherWrapper").appendChild(div);

                    publisher = TB.initPublisher(apiKey, div.id, options);
                    return publisher;
                }
            }
        }

        function _postMessage(chatMsg) {
            var deferred = $q.defer();
            session.signal({ data: chatMsg, type: 'textMessage' }, function (error) {
                if (error) {
                    deferred.reject(error.message);
                }
                else {
                    deferred.resolve();
                }
            });
            return deferred.promise;
        }

        function _disconnect() {
            var deferred = $q.defer();
            session.on('sessionDisconnected', onSessionDisconnected)
                .disconnect();

            function onSessionDisconnected(event) {
                console.log('_disconnect', 'session disconnected: ' + event);
                if (publisher) {
                    session.unpublish(publisher);
                }
                session.off();
                session = null;
                publisher = null;
                chatCallbackFn = null;
                deferred.resolve();
            }
            return deferred.promise;
        }
    }
})();