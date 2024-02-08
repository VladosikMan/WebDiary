const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
import { cloudresourcemanager_v1beta1 } from "googleapis";
import {Task} from "./Task"

//сюда записывается токен пользователя, который прилетит отдельной ссылкой к серверу



// Refer to the Node.js quickstart on how to setup the environment:
// https://developers.google.com/calendar/quickstart/node
// Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
// stored credentials.

var heroku : any;

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
var tkn : any;

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
// If modifying these scopes, delete token.json.
//const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
export function initSyncing(code : any){
  tkn = code;

  
  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err : any, content : any) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), listEvents);
  });

}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials : any , callback : any) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err : any, token : any) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}



/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client : any, callback : any) {

  //ждем токен, который прилетел от ссылки
  
    oAuth2Client.getToken(tkn, (err : any, token : any) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err : any) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });

}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth : any) {
  const calendar = google.calendar({version: 'v3', auth});

  heroku = auth;
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err : any, res : any) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event : any, i : any) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary} - ${event.id}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
  //функция добавления задачи
}

export function addEvent(task : Task){
    // Require google from googleapis package.
    const { google } = require('googleapis')
    // Require oAuth2 from our google instance.
    const { OAuth2 } = google.auth

    // Create a new instance of oAuth and set our Client ID & Client Secret.
    const oAuth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET)

    // Call the setCredentials method on our oAuth2Client instance and set our refresh token.
    oAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
    })
    // Create a new calender instance.
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })
    console.log(transpilData(task.date));
    var startDt = new Date(transpilData(task.date));
    var finishDt = new Date(startDt);
    finishDt.setMinutes(finishDt.getMinutes() + 60);
    console.log(startDt);
    console.log(finishDt);
  
      var event = {
        'id': createGoogleId(task.id),
        'summary': task.task,
        'start': {
          'dateTime': startDt,
        },
        'end': {
          'dateTime': finishDt,
        },
      };
  calendar.events.insert({
        auth: heroku,
        calendarId: 'primary',
        resource: event,
      }, function(err : any, event : any) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        console.log('Event created: %s', event.htmlLink);
      })                                                  
}

export function deleteEvent(eventId : number){
  // Require google from googleapis package.
  const { google } = require('googleapis')
  // Require oAuth2 from our google instance.
  const { OAuth2 } = google.auth
  // Create a new instance of oAuth and set our Client ID & Client Secret.
  const oAuth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET)
  // Call the setCredentials method on our oAuth2Client instance and set our refresh token.
  oAuth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
  })
  console.log(eventId);
  // Create a new calender instance.
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  var params = {
    auth: heroku,
    calendarId: 'primary',
    eventId: eventId,
  };
  calendar.events.delete(params, function(err : any) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    console.log('Event deleted.');
  });
        
}
  
function transpilData(dt : string):string{
  var dataStr : string = dt.replace(/\s/g, '');
  dataStr = dataStr.substring(0,10) + "T" + dataStr.substring(10,dataStr.length);
  return dataStr;
}
function createGoogleId(id : number) : number{
  return 20002409 + id;
}