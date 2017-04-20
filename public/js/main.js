'use strict'

// get a reference of the database instance
var theDB = firebase.database();

// user info
var profilePicUrl = null;
var userName = null;

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

});

// initialize side menu
$(function() {

});

$(function() {
	
});

$(function() {
	

});
