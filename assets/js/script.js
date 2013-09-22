/* Author: Hugh Rawlinson

© Code O'Clock Industries :P

*/

var AJAX_PROTOCOL = 'http://';

var MUSIXMATCH_CONFIG = {
    host: 'api.musixmatch.com',
    url: '/ws/1.1/',
    apiKey: 'fe849caad54e6d25b2bb215763dedf0b'
}

'use strict';

$(document).ready(function(){
    $("#action").click(facebookLogin);
});

var facebookLogin = function() {
    console.log('logging in to FB');
    FB.login(function() {
        loggedInToFacebook();
    }, {
        scope: 'publish_actions,user_actions.music'
    });
};
var index = 0;
var ofs = 0;

var songs = [];
var artistPlayCount = {};
var songPlayCount = {};
var track = {};

var playsong = function(a,s){
    track = window.tomahkAPI.Track(s,a, {
        width: 300,
        height: 300,
        disabledResolvers: [
            "SpotifyMetadata"
            // options: "SoundCloud", "Officialfm", "Lastfm", "Jamendo", "Youtube", "Rdio", "SpotifyMetadata", "Deezer", "Exfm"
        ],
        handlers: {
            onloaded: function() {
                log(track.connection+":\n  api loaded");
            },
            onended: function() {
                log(track.connection+":\n  Song ended: "+track.artist+" - "+track.title);
            },
            onplayable: function() {
                log(track.connection+":\n  playable");
                track.play();
            },
            onresolved: function(resolver, result) {
                log(track.connection+":\n  Track found: "+resolver+" - "+ result.track + " by "+result.artist);
            }
        }
    });
    $('#player').html(track.render);
}

var mediaclick = function(){
    var artist = $(this).find('.media-heading').text();
    var song = $($(this).find('.media-body').contents()[1]).text();
    console.log(artist);
    console.log(song);
    playsong(artist,song);
}

var populatePlays= function(){
    FB.api('/me/music.listens?limit=25&offset='+ofs,function(response){
        if(!response.error){
            if(response.data.length<1){
                $('.media').unbind('click');
                $('.media').click(mediaclick);
                return;
            }
            ofs += 25;
            for(var n = 0; n < response.data.length; n++){
                FB.api(response.data[n].data.song.id,function(song){
                    songs.push(song);
                    var track = song.title;
                    var artist = song.data.musician[0].name;
                    var imgurl = song.image[0].url;
                    $('#sl'+(index%3+1)).append('<li class="media"><img class="media-object pull-left" src=\"'+imgurl + '\"></img><div class="media-body"><h4 class="media-heading">' + artist + '</h4>' + track + '</div></li>');
                    index++;
                });
            }
            populatePlays();
            $('.media').unbind('click');
            $('.media').click(mediaclick);
            doStats();
        }
        else{
            console.log(response);
            return;
        }
    });
};

function compare(a,b) {
    if (a.data.musician[0].name.toLowerCase() < b.data.musician[0].name.toLowerCase())
        return -1;
    if (a.data.musician[0].name.toLowerCase() > b.data.musician[0].name.toLowerCase())
        return 1;
    return 0;
}

var doStats = function(){
    $('#totalplays').text(songs.length);
    songs.sort(compare);
    artistPlayCount = {};
    songPlayCount = {};
    for(var i = 0; i < songs.length; i++){
        if(artistPlayCount[songs[i].data.musician[0].name]===null||artistPlayCount[songs[i].data.musician[0].name]===undefined){
            artistPlayCount[songs[i].data.musician[0].name] = 0;
        }
        artistPlayCount[songs[i].data.musician[0].name]++;
        if(songPlayCount[songs[i].title]===null||songPlayCount[songs[i].title]===undefined){
            songPlayCount[songs[i].title] = 0;
        }
        songPlayCount[songs[i].title]++;
    }
    var songSort = []
    var artistSort = [];
    for (var artist in artistPlayCount)
        artistSort.push([artist, artistPlayCount[artist]]);
    artistSort.sort(function(a, b) {return a[1] - b[1]});
    artistSort.reverse();
    for (var song in songPlayCount)
        songSort.push([song, songPlayCount[song]]);
    songSort.sort(function(a, b) {return a[1] - b[1]});
    songSort.reverse();
    $('#uniqueartists').text(artistSort.length);
    $('#uniquesongs').text(songSort.length);
    var artistleaderboard = $('#artistrank');
    var songleaderboard = $('#songrank');
    artistleaderboard.text('');
    songleaderboard.text('');
    for (var i = 0; i < 10; i++){
        artistleaderboard.append('<li><em>'+artistSort[i][1]+'</em> '+artistSort[i][0]+'</li>');
        songleaderboard.append('<li><em>'+songSort[i][1]+'</em> '+songSort[i][0]+'</li>');
    }
}

var loggedInToFacebook = function() {
    populatePlays();
};

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