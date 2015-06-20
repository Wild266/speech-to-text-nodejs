
var effects = require('./views/effects');
var display = require('./views/display');
var initSocket = require('./socket').initSocket;

exports.handleFileUpload = function(token, model, file, contentType, callback, onend) {

    var currentlyDisplaying = JSON.parse(localStorage.getItem('currentlyDisplaying'));

    if (currentlyDisplaying) {
      showError('Currently displaying another file, please wait until complete');
      return;
    }

    console.log('setting image');
    // $('#progressIndicator').css('visibility', 'visible');

    localStorage.setItem('currentlyDisplaying', true);

    $.subscribe('progress', function(evt, data) {
      console.log('progress: ', data);
    });

    var micIcon = $('#microphoneIcon');

    console.log('contentType', contentType);

    var baseString = '';
    var baseJSON = '';

    var options = {};
    options.token = token;
    options.message = {
      'action': 'start',
      'content-type': contentType,
      'interim_results': true,
      'continuous': true,
      'word_confidence': true,
      'timestamps': true,
      'max_alternatives': 3
    };
    options.model = model;

    function onOpen(socket) {
      console.log('Socket opened');
    }

    function onListening(socket) {
      console.log('Socket listening');
      callback(socket);
    }

    function onMessage(msg) {
      console.log('Socket msg: ', msg);
      if (msg.results) {
        // Convert to closure approach
        baseString = display.showResult(msg, baseString);
        baseJSON = display.showJSON(msg, baseJSON);
      }
    }

    function onError(evt) {
      onend(evt);
      console.log('Socket err: ', evt.code);
      localStorage.setItem('currentlyDisplaying', false);
    }

    function onClose(evt) {
      onend(evt);
      console.log('Socket closing: ', evt);
      localStorage.setItem('currentlyDisplaying', false);
    }

    initSocket(options, onOpen, onListening, onMessage, onError, onClose);

  }
