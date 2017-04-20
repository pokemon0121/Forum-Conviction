/*!
 * Start Bootstrap - SB Admin 2 v3.3.7+1 (http://startbootstrap.com/template-overviews/sb-admin-2)
 * Copyright 2013-2016 Start Bootstrap
 * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap/blob/gh-pages/LICENSE)
 */
 
 'use strict'


var currentTopic = null;

var editingMessageKey = null;

// Loads the correct sidebar on window load,
// collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
  // Checks that the Firebase SDK has been correctly setup and configured.
    if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
      window.alert('You have not configured and imported the Firebase SDK. ' +
          'Make sure you go through the codelab setup instructions.');
    } else if (config.storageBucket === '') {
      window.alert('Your Cloud Storage bucket has not been enabled. Sorry about that. This is ' +
          'actually a Firebase bug that occurs rarely. ' +
          'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
          'and make sure the storageBucket attribute is not empty. ' +
          'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
          'displayed there.');
    }
 
    $('#side-menu').metisMenu();

    
    
    $(window).bind("load resize", function() {
      var topOffset = 50;
      var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
      if (width < 768) {
        $('div.navbar-collapse').addClass('collapse');
        topOffset = 100; // 2-row-menu
      } else {
        $('div.navbar-collapse').removeClass('collapse');
      }

      var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
      height = height - topOffset;
      if (height < 1) height = 1;
      if (height > topOffset) {
        $("#page-wrapper").css("min-height", (height) + "px");
      }
    });

    // enable and disable submit button
    // based on whether there is something in the input box
    $('#input-box').keyup(function() {
      if ($(this).val() == '') {
          $('#submit').prop('disabled', true);
      }
      else {
          $('#submit').prop('disabled', false);
      } 
    });

    $('#input-box').keydown(function(e) {
      if (e.keycode == 13) {
          e.preventDefault();
          return false;
      }
    });
    
    // submit message
    // and restore input and button
    $('#submit').click(function(e) {
      e.preventDefault();
      if (firebase.auth().currentUser == null) {
        $('#snackbar').text('You have to log in first!');
        $('#snackbar').addClass('show');
        setTimeout(function(){ $('#snackbar').removeClass('show'); }, 3000);
        return;
      }
      console.log("message: " + $('#input-box').val() + " was sent to topic " + currentTopic + ".");
      var curUser = firebase.auth().currentUser;
      var curTime = new Date().toLocaleString();
      firebase.database().ref(currentTopic).push({
        username : curUser.displayName,
        profileImg : curUser.photoURL,
        message : $('#input-box').val(),
        timestamp : curTime,
        uid : curUser.uid
      });
      $('#input-box').val('');
      $('#input-holder').removeClass('is-dirty');
      $('#submit').prop('disabled', true);
    });

});


$(document).on('click', '.edit-msg', function() {    
  console.log('message id : ' + $(this).parent().attr('id') + ' clicked, ready to edit.');
  if (firebase.auth().currentUser == null) {
    $('#snackbar').text('You cannot edit message without logg-in!');
    $('#snackbar').addClass('show');
    setTimeout(function(){ $('#snackbar').removeClass('show'); }, 3000);
    return;
  }
  if (currentTopic == null || currentTopic == '') {
    console.log("currentTopic is not right. return.");
    return;
  }
  var msgKey = $(this).parent().attr('id');
  firebase.database().ref(currentTopic).child(msgKey).once('value').then(function(snapshot) {
    var userid = snapshot.val().uid;
    //console.log(userid == firebase.auth().currentUser.uid);
    if (userid != firebase.auth().currentUser.uid) {
      $('#snackbar').text('This message is not yours.');
      $('#snackbar').addClass('show');
      setTimeout(function(){ $('#snackbar').removeClass('show'); }, 3000);
      return;
    }
    if (editingMessageKey == null) {
      editingMessageKey = msgKey;
    }
    showDialog({
            title: 'Update message',
            text: 'Enter your new message below.',
            negative: {
                title: 'Cancel'
            },
            positive: {
                title: 'Send'
            },
            cancelable: false
        });
    // set up overlap to cover full document
    $('.dialog-container').height($(document).height());
    // set position of input box
    $('.dialog-container > div').css('margin-top', $('#' + msgKey).offset().top - $('.dialog-container > div').height() / 2);

  });
});

$(document).on('click', '.del-msg', function() {
  console.log('message id : ' + $(this).parent().attr('id') + 'clicked, ready to delete.');
  if (firebase.auth().currentUser == null) {
    $('#snackbar').text('You cannot delete message without logg-in!');
    $('#snackbar').addClass('show');
    setTimeout(function(){ $('#snackbar').removeClass('show'); }, 3000);
    return;
  }
  if (currentTopic == null || currentTopic == '') {
    console.log("currentTopic is not right. return.");
    return;
  }
  var msgKey = $(this).parent().attr('id');
  firebase.database().ref(currentTopic).child(msgKey).once('value').then(function(snapshot) {
    var userid = snapshot.val().uid;
    //console.log(userid == firebase.auth().currentUser.uid);
    if (userid != firebase.auth().currentUser.uid) {
      $('#snackbar').text('This message is not yours.');
      $('#snackbar').addClass('show');
      setTimeout(function(){ $('#snackbar').removeClass('show'); }, 3000);
      return;
    }
    firebase.database().ref(currentTopic + '/' + msgKey).remove().then(function() {
        console.log('message ' + msgKey + ' removed.');
        $('#snackbar').text('Message deleted!');
        $('#snackbar').addClass('show');
        setTimeout(function(){ $('#snackbar').removeClass('show'); }, 3000);
    }).catch(function(error) {
      $('#snackbar').text('Message deletion failed!');
      $('#snackbar').addClass('show');
      setTimeout(function(){ $('#snackbar').removeClass('show'); }, 3000);
      console.log("Remove failed: " + error.message)
    });
    //console.log("uid of this message: " + userid + ", uid of current user: " + firebase.auth().currentUser.uid);
  });

});

// monitor user login state
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var userName = user.displayName;
        var profilePicUrl = user.photoURL;
        // Set the user's profile pic and name.
        $('#user-pic').css("background-image", "url(" + profilePicUrl + ")");
        $('#user-name').text(userName);
        // Show user's profile and sign-out button.
        $('#user-name').show();
        $('#user-pic').show();
        $('#sign-out').show();

        // Hide sign-in button.
        $("#sign-in").hide();
    } 
    else {
        // Hide user's profile and sign-out button.
        $("#user-name").hide();
        $("#user-pic").hide();
        $("#sign-out").hide();
        // Show sign-in button.
        $("#sign-in").show();
    }
  });

    // what would happen when users click sign-in button
    $('#sign-in').click(function() {
    // Sign in Firebase using popup auth and Google as the identity provider.
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log(user);
        $('#home').trigger('click');
    }).catch(function(error) {
      console.log(error);
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
    });

    
  });
  // what would happen when users click sign-out button
  $('#sign-out').click(function() {
    firebase.auth().signOut().then(function() {
        $('#home').trigger('click');
        // Sign-out successful.
    }).catch(function(error) {
        console.log(error);
    });   
  });


// toggle topics
$('.topic-botton').click(function() {
  firebase.database().ref(currentTopic + "/").off();
  if (typeof($(this).attr('id')) == 'undefined') {
    console.log("no action here. return.");
    return;
  }
  currentTopic = $(this).attr('id');
  console.log($(this).attr('id') + " clicked.");
  $('#message-box tbody').empty();
  $('#page-header').text($(this).find('a').text());
  if ($(this).attr('id') != "home") {
    $('#home-content').hide();
    $('#input-message').show();
  }
  else {
    $('#home-content').show();
    $('#input-message').hide();
  }
  // load messages for topics  
    firebase.database().ref(currentTopic + "/").limitToLast(50).on('child_added', function(data) {
      var key = data.key;
      var newMessage = data.val();
      $('#message-box tbody').append(
        '<tr id=\"' + key + '\">' +
          '<td style=\"width: 5%;\"><div style=\"height: 40px; width: 40px; background-size: 40px; border-radius: 40px; background-image: url(&quot;' + newMessage.profileImg + '&quot;);\"></div></td>' +
          '<td style=\"width: 79%;\"><div class=\"name-time\" style=\"font-weight: 500; font-style: italic; font-size: 1.0rem;">' + newMessage.username + '     ' + newMessage.timestamp + '</div><div class=\"msg\">' + newMessage.message + '</div></td>' +
          '<td class="delete edit-msg" style="width: 8%; vertical-align: middle; color: #53f441;"><i class="fa fa-pencil-square-o delete-btn tooltip" aria-hidden="true"><span class="tooltiptext">edit</span></i></td>' +
          '<td class="delete del-msg" style="width: 8%; vertical-align: middle; color: #f45042;"><i class="fa fa-times delete-btn tooltip" aria-hidden="true"><span class="tooltiptext">recall</span></i></td>' +
        '</tr>'
      );
    });


    firebase.database().ref(currentTopic + "/").on('child_removed', function(data) {
      var removedKey = data.key;
      $('#' + removedKey).remove();
      console.log("message " + removedKey + " has been removed.");
    });

    firebase.database().ref(currentTopic + "/").on('child_changed', function(data) {
      var changedKey = data.key;
      var uname = firebase.auth().currentUser.displayName;
      var newTime = data.val().timestamp;
      var newMsg = data.val().message;
      $('#' + changedKey).find('.name-time').text(uname + '     ' + newTime);
      $('#' + changedKey).find('.msg').text(newMsg);
      console.log("message " + changedKey + " has been updated.");
    });
});


$('.ttspan-right').on('click', function(e) {
  console.log('right');
  e.preventDefault();
  $("#wrapper").toggleClass("tt-toggled");
});

function showDialog(options) {
    options = $.extend({
        id: 'orrsDiag',
        title: null,
        text: null,
        negative: false,
        positive: false,
        cancelable: true,
        contentStyle: null,
        onLoaded: false
    }, options);

    // remove existing dialogs
    $('.dialog-container').remove();
    $(document).unbind("keyup.dialog");

    $('<div id="' + options.id + '" class="dialog-container"><div class="mdl-card mdl-shadow--16dp"></div></div>').appendTo("body");
    var dialog = $('#orrsDiag');
    var content = dialog.find('.mdl-card');
    if (options.contentStyle != null) content.css(options.contentStyle);
    if (options.title != null) {
        $('<h5>' + options.title + '</h5>').appendTo(content);
    }
    if (options.text != null) {
        $('<p>' + options.text + '</p>').appendTo(content);
    }
    $('<form id="edit-message-form">' +
            '<div id="input-holder" style="width: 100%;" class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">' +
              '<input id="edit-input-box" class="mdl-textfield__input" type="text" id="edit-message">' +
              '<label class="mdl-textfield__label" for="message">Message...</label>' +
            '</div>' +
          '</form>').appendTo(content);
    if (options.negative || options.positive) {
        var buttonBar = $('<div class="mdl-card__actions dialog-button-bar"></div>');
        if (options.negative) {
            options.negative = $.extend({
                id: 'negative',
                title: 'Cancel',
                onClick: function () {
                    return false;
                }
            }, options.negative);
            var negButton = $('<button class="mdl-button mdl-js-button mdl-js-ripple-effect" id="' + options.negative.id + '">' + options.negative.title + '</button>');
            negButton.click(function (e) {
                e.preventDefault();
                if (!options.negative.onClick(e))
                    hideDialog(dialog)
            });
            negButton.appendTo(buttonBar);
        }
        if (options.positive) {
            options.positive = $.extend({
                id: 'positive',
                title: 'OK',
                onClick: function () {
                    return false;
                }
            }, options.positive);
            var posButton = $('<button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="' + options.positive.id + '">' + options.positive.title + '</button>');
            posButton.click(function (e) {
                e.preventDefault();
                if (!options.positive.onClick(e))
                    console.log('new message is : ' + $('#edit-input-box').val());
                    if (editingMessageKey == null) {
                      $('#snackbar').text('Message update not successful!');
                      $('#snackbar').addClass('show');
                      setTimeout(function(){ $('#snackbar').removeClass('show'); }, 3000);
                    }
                    var updatedMessage = $('#edit-input-box').val();
                    var updates = {};
                    updates['message'] = updatedMessage;
                    updates['timestamp'] = new Date().toLocaleString();
                    //console.log("updated message: " + JSON.stringify(updates));
                    firebase.database().ref(currentTopic + '/' + editingMessageKey + '/').update(updates);
                    $('#snackbar').text('This message has been updated!');
                    $('#snackbar').addClass('show');
                    setTimeout(function(){ $('#snackbar').removeClass('show'); }, 3000);
                    console.log("message " + editingMessageKey + " changed and saved!");
                    editingMessageKey = null;
                    hideDialog(dialog)
            });
            posButton.appendTo(buttonBar);
        }
        buttonBar.appendTo(content);
    }
    componentHandler.upgradeDom();
    if (options.cancelable) {
        dialog.click(function () {
            hideDialog(dialog);
        });
        $(document).bind("keyup.dialog", function (e) {
            if (e.which == 27)
                hideDialog(dialog);
        });
        content.click(function (e) {
            e.stopPropagation();
        });
    }
    setTimeout(function () {
        dialog.css({opacity: 1});
        if (options.onLoaded)
            options.onLoaded();
    }, 1);
}

function hideDialog(dialog) {
    $(document).unbind("keyup.dialog");
    dialog.css({opacity: 0});
    setTimeout(function () {
        dialog.remove();
    }, 400);
}
