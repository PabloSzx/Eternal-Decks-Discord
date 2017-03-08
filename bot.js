var Discordie = require('discordie');
var _ = require('lodash');
var firebase = require('firebase');

var app = firebase.initializeApp({
  apiKey: process.env.firebaseapikey,
  authDomain: "eternal-esp-decks.firebaseapp.com",
  databaseURL: "https://eternal-esp-decks.firebaseio.com",
  storageBucket: "eternal-esp-decks.appspot.com",
  messagingSenderId: "192869312927"
 });
const Events = Discordie.Events;
const client = new Discordie();

const users = {
  215658764097945601: 'PabloSz',
  194835926533275648: 'mishiDsD',
  281464881880891394: 'Sneaky',
  156050903546200064: 'EpithSlayer'
}

client.connect({
  token: process.env.token
});

client.Dispatcher.on(Events.GATEWAY_READY, e => {
  console.log('Conectado como: ' + client.User.username);
});

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
  if (e.message.author.username !== 'Eternal-Decks') {
  let user = parseInt(e.message.author.id);
  console.log(`${e.message.author.username} ${e.message.author.id}`);
  const content = e.message.content;
  // console.log(e);
  if ((content.trim().substring(0, 11) === '!crear-deck') && (users[user])) {
    // msg = content.substring(7).trim().split(' ');
    name = content.substring(11).trim().substring(0, content.substring(11).trim().indexOf('\n')).trim().toLowerCase();
    clipboard = content.substring(12).trim().substring(content.substring(12).trim().indexOf('\n')).trim();

    firebase.database().ref().update({
      [name]: clipboard
    });

    e.message.channel.sendMessage('Deck creado satisfactoriamente a nombre de: \'' + name + '\'');
  } else if (content.toLowerCase().trim().substring(0, 5) === '!deck') {
    if (!content.substring(5).trim()) {
      firebase.database().ref().once('value', (snapshot) => {
        const decks = snapshot.val();
        let msg = 'Decks disponibles:';
        _.map(decks, (value, key) => {
          msg = `${msg}\n:white_small_square:${key}`;
        });
        e.message.channel.sendMessage(msg);
      });
    } else {
    var name = firebase.database().ref(content.substring(5).trim().toLowerCase());
    name.once('value', (snapshot) => {
      if (snapshot.val()) {
        e.message.channel.sendMessage(snapshot.val());
      } else {
        e.message.channel.sendMessage('No se ha encontrado ningun deck en especifico a nombre de ' + content.substring(5).trim().toLowerCase());
        firebase.database().ref().once('value', (snapshot) => {
          const decks = snapshot.val();
          let msg = 'Pero se han encontrado los siguientes deck con ' + content.substring(5).trim().toLowerCase() + '\n';
          let found = false;
          _.map(decks, (value, key) => {
            if (key.toLowerCase().indexOf(content.substring(5).trim().toLowerCase()) !== -1) {
              if (!found) {
                found = true;
              }
              msg = `${msg}\n:white_small_square:${key}`;
            }
          });
          if (found) {
            e.message.channel.sendMessage(msg);
          }
        })
      }
    });

    }
  }

}
});
