// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );
        FirebasePlugin.getToken(function (token) {
            localStorage["FCMToken"] = token;
        }, function (error) {
            console.error(error);
            alert(JSON.stringify(error));
        });

        FirebasePlugin.onTokenRefresh(function (token) {
            localStorage["FCMToken"] = token;
        }, function (error) {
            console.error(error);
            alert(JSON.stringify(error));
        });

        FirebasePlugin.onNotificationOpen(function (notification) {
            console.log(notification);
            if (notification.tap) {
                localStorage["Message"] = JSON.stringify(notification);
                //location.reload();
                location.href = "index.html";
            }
        }, function (error) {
            console.error(error);
            alert(JSON.stringify(error));
        });
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };

    function errorFun(err) {
        console.log(err);
    };
} )();