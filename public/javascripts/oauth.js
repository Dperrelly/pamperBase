// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '963446768456-2ebrcpcvtl13kpnihcgemst09dhjl94s.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.style.display = 'none';
    $('#cat').show();
    loadSheetsApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
    $('#cat').hide();
    $('#hider').hide();
    $('#wrapper').hide();
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

/**
 * Load Sheets API client library.
 */
function loadSheetsApi() {
  var discoveryUrl =
      'https://sheets.googleapis.com/$discovery/rest?version=v4';
  gapi.client.load(discoveryUrl).then(main);
}

function listMajors() {
  // gapi.client.sheets.spreadsheets.values.get({
  //   spreadsheetId: '1g_RV4hpbn-dJ5GsfyHHOZ6a3FxHecevTmts84kN2jp8',
  //   range: 'A2:E',
  // }).then(function(response) {
  // 	console.log(gapi.client);
  //   var range = response.result;
  //   if (range.values.length > 0) {
  //     appendPre('Passions of Sophia\ntv show passions | RL passions:\n');
  //     for (i = 0; i < range.values.length; i++) {
  //       var row = range.values[i];
  //       // Print columns A and E, which correspond to indices 0 and 4.
  //       appendPre(row[0] + ' | ' + row[1]);
  //     }
  //   } else {
  //     appendPre('No data found.');
  //   }
  // }, function(response) {
  //   appendPre('Error: ' + response.result.error.message);
  // });
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('output');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

window.onload = checkAuth;