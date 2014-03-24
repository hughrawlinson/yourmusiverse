/* Author: Hugh Rawlinson

© Code O'Clock Industries :P

*/

'use strict';

var loggedInToFacebook = function() {
    $('#logintron').remove();
    $('.content').show(1000);
    populatePlays();
};


var facebookLogin = function() {
    // ...pretty self explanatory
    FB.login(function() {
        console.log('logging in to FB');
    }, {
        scope: 'publish_actions,user_actions.music'
    });
};

$(document).ready(function(){
    $('#action').click(facebookLogin);
});

var index = 0;
var ofs = 0;

// array of all played songs
var songs = [];

// playcount keypairs
var artistPlayCount = {};
var songPlayCount = {};
var servicePlayCount = {};

// toma.hk track
var track = {};

var playsong = function(a,s){
    // Reconfig toma.hk track
    track = window.tomahkAPI.Track(s,a, {
        width: 300,
        height: 300,
        disabledResolvers: [
            'SpotifyMetadata'
            // options: 'SoundCloud', 'Officialfm', 'Lastfm', 'Jamendo', 'Youtube', 'Rdio', 'SpotifyMetadata', 'Deezer', 'Exfm'
        ],
        handlers: {
            onloaded: function() {
                console.log(track.connection+':\n  api loaded');
            },
            onended: function() {
                console.log(track.connection+':\n  Song ended: '+track.artist+' - '+track.title);
            },
            onplayable: function() {
                console.log(track.connection+':\n  playable');
                track.play();
            },
            onresolved: function(resolver, result) {
                console.log(track.connection+':\n  Track found: '+resolver+' - '+ result.track + ' by '+result.artist);
            }
        }
    });
    $('#player').html(track.render);
};

// to bind to .media elements to facilitate toma.hk player
var mediaclick = function(){
    var artist = $(this).find('.media-heading').text();
    var song = $($(this).find('.media-body').contents()[1]).text();
    console.log(artist);
    console.log(song);
    playsong(artist,song);
};

// facilitate sorting based on musician name
function compare(a,b) {
    if (a.data.musician[0].name.toLowerCase() < b.data.musician[0].name.toLowerCase()){
        return -1;
    }
    if (a.data.musician[0].name.toLowerCase() > b.data.musician[0].name.toLowerCase()){
        return 1;
    }
    return 0;
}

var doStats = function(){
    // sets total play count
    $('#totalplays').text(songs.length);

    // unnecessary
    songs.sort(compare);

    // reinitialises the playcount keypair objects
    artistPlayCount = {};
    songPlayCount = {};
    servicePlayCount = {};

    // iterates through songs populating playcount keypairs
    for(var i = 0; i < songs.length; i++){
        if(artistPlayCount[songs[i].data.musician[0].name]===null||artistPlayCount[songs[i].data.musician[0].name]===undefined){
            artistPlayCount[songs[i].data.musician[0].name] = 0;
        }
        artistPlayCount[songs[i].data.musician[0].name]++;

        if(songPlayCount[songs[i].title]===null||songPlayCount[songs[i].title]===undefined){
            songPlayCount[songs[i].title] = 0;
        }
        songPlayCount[songs[i].title]++;

        if(servicePlayCount[songs[i].site_name]===null||servicePlayCount[songs[i].site_name]===undefined){
            servicePlayCount[songs[i].site_name] = 0;
        }
        servicePlayCount[songs[i].site_name]++;
    }

    // Artist Leaderboard
    var artistSort = [];
    for (var artist in artistPlayCount){
        artistSort.push([artist, artistPlayCount[artist]]);
    }
    artistSort.sort(function(a, b) {return a[1] - b[1];});
    artistSort.reverse();
    // Set Unique Artists Count
    $('#uniqueartists').text(artistSort.length);
    var artistleaderboard = $('#artistrank');
    artistleaderboard.text('');
    for (var i = 0; i < 10 && i < artistSort.length; i++){
        artistleaderboard.append('<li><em>'+artistSort[i][1]+'</em> '+artistSort[i][0]+'</li>');
    }

    // Top 10 Songs
    var songSort = [];
    for (var song in songPlayCount){
        songSort.push([song, songPlayCount[song]]);
    }
    songSort.sort(function(a, b) {return a[1] - b[1];});
    songSort.reverse();
    $('#uniquesongs').text(songSort.length);
    var songleaderboard = $('#songrank');
    songleaderboard.text('');
    for (var i = 0; i < 10 && i < songSort.length; i++){
        songleaderboard.append('<li><em>'+songSort[i][1]+'</em> '+songSort[i][0]+'</li>');
    }

    // Top 10 Services
    var serviceSort = [];
    for (var service in servicePlayCount){
        serviceSort.push([service, servicePlayCount[service]]);
    }
    serviceSort.sort(function(a, b) {return a[1] - b[1];});
    serviceSort.reverse();
    $('#uniqueservices').text(serviceSort.length);
    var serviceleaderboard = $('#servicerank');
    serviceleaderboard.text('');
    for (var i = 0; i < 10 && i < serviceSort.length; i++){
        serviceleaderboard.append('<li><em>'+serviceSort[i][1]+'</em> '+serviceSort[i][0]+'</li>');
    }
};

// page through FB plays and populate the songs array and the songs UI recursively (sort of)
var populatePlays= function(){
    FB.api('/me/music.listens?limit=25&offset='+ofs,function(response){
        // catch FB API errors
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
        // catch FB API errors
        else{
            console.log(response);
            return;
        }
    });
};

////////////////////////
//FACEBOOK LOGIN STUFF//
////////////////////////

window.fbAsyncInit = function() {
    $( "#action" ).prop( "disabled", false );
    FB.init({
        // To be honest, I don't care knows my development FB API key.
        // It's not like you're going to bother use it.
        appId: '134327086719273',
        status: true,
        cookie: true,
        xfbml: true
    });

    FB.getLoginStatus(function(response) {
        if(response.status === 'connected') {
            var uid = response.authResponse.userID;
            var accessToken = response.authResponse.accessToken;
            loggedInToFacebook();
        } else if(response.status === 'not_authorized') {
            alert('ok then...!');
        } else {
            alert('no, log in...');
        }
    });
};

// Load the FB SDK's source Asynchronously
(function(d, debug) {
    var js, id = 'facebook-jssdk',
    ref = d.getElementsByTagName('script')[0];
    if(d.getElementById(id)) {
        return;
    }
    js = d.createElement('script');
    js.id = id;
    js.async = true;
    js.src = 'http://connect.facebook.net/en_US/all' + (debug ? '/debug' : '') + '.js';
    ref.parentNode.insertBefore(js, ref);
}(document, /*debug*/ false));
