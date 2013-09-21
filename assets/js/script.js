/* Author: Hugh Rawlinson

© Code O'Clock Industries :P

*/

'use strict';

$(document).ready(function(){
    $("#action").click(facebookLogin);
});

var facebookLogin = function() {
    console.log('logging in to FB');
    FB.login(function() {
        loggedInToFacebook();
    }, {
        scope: 'publish_actions,friends_actions.music'
    });
};

var loggedInToFacebook = function() {
    FB.api('/me/music.listens'function(data){
        console.log(data);
    });
}

////////////////////////
//FACEBOOK LOGIN STUFF//
////////////////////////

window.fbAsyncInit = function() {
  // init the FB JS SDK
    FB.init({
        appId: '341862115846576',
        // App ID from the App Dashboard
        //channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File for x-domain communication
        status: true,
        // check the login status upon init?
        cookie: true,
        // set sessions cookies to allow your server to access the session?
        xfbml: true // parse XFBML tags on this page?
    });

    FB.getLoginStatus(function(response) {
        if(response.status === 'connected') {
            var uid = response.authResponse.userID;
            var accessToken = response.authResponse.accessToken;
        } else if(response.status === 'not_authorized') {
            // the user is logged in to Facebook, 
            // but has not authenticated your app
        } else {
            // the user isn't logged in to Facebook.
        }
    });
    // Additional initialization code such as adding Event Listeners goes here
};

// Load the SDK's source Asynchronously
(function(d, debug) {
    var js, id = 'facebook-jssdk',
    ref = d.getElementsByTagName('script')[0];
    if(d.getElementById(id)) {
        return;
    }
    js = d.createElement('script');
    js.id = id;
    js.async = true;
    js.src = "http://connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
    ref.parentNode.insertBefore(js, ref);
}(document, /*debug*/ false));