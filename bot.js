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

var history = {
  PabloSz: true,
  mibaito: true
};

const users = {
  215658764097945601: 'PabloSz',
  194835926533275648: 'mishiDsD',
  281464881880891394: 'Sneaky',
  156050903546200064: 'EpithSlayer',
  285088494869544962: 'mibaito'
}

client.connect({
  token: process.env.token
  // token: 'Mjg3NzczODQ0OTMwODIyMTQ0.C50J1g.Ghuj21Hqv36Wk3HcWXQ2I9U5aUo' //test server
});

client.Dispatcher.on(Events.GATEWAY_READY, e => {
  console.log('Conectado como: ' + client.User.username);
  client.Users.fetchMembers().then(() => {
    // console.log(client.Users.membersForChannel('281797507070164992'));
    // console.log(client.Users.get('287974333559865345'));
    client.Users.get('287974333559865345').openDM().then((channel, error) => {
      channel.sendMessage('PING');
      console.log('PING');
    })
  });
  // client.Users.get('<@287974333559865345>').openDM().then(() => {
  //   console.log('asdasdasd');
  // })
});

client.Dispatcher.on(Events.TYPING_START, e => {
  try {
  const user = e.user.username;
  const id = e.user.id;
  if (history[user] === undefined) {
    history[user] = false;
    // console.log('Registro de usuarios incrementado.');
    // console.log(history);
  }
  if (e.channel.isPrivate && (history[user] === false)) {
    console.log(user + ' ha conversado conmigo en privado por primera vez.');
    let msg = 'Hola! :wave: Al conversar conmigo por mensaje privado ' +
    'no es necesario que me escribas con \"!deck\", aqui ' +
    'puedes escribir directamente el nombre del deck y te dare el deck listo para importarlo en el juego.'
    e.channel.sendMessage(msg);
    if (users[parseInt(id)]) {
      msg = '\n\nPero si deseas meter un deck en la base de datos, aun tienes que escribir ' +
      '\n\n\"!crear-deck <nombre del deck (si se permiten espacios)> <un salto de linea (shift+enter)> <clipboard del deck>\"' +
      '\n(Sin los \'<>\')'
      e.channel.sendMessage(msg);
    }
    history[user] = true;
  }

} catch (err) {
  //empty
}
});

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
  try {
  if (e.message.author.username !== 'Eternal-Decks') {
  // console.log(e);
  let share = false;
  let user = parseInt(e.message.author.id);
  // console.log(`${e.message.author.username} ${e.message.author.id}`);
  const content = e.message.content;

  if (e.message.isPrivate && (content.trim() === 'PONG')) {
    setTimeout(() => {
      e.message.channel.sendMessage('PING');
      console.log('PING');
    }, 600000);
  } else if (user !== 287974333559865345) {
  // console.log(e);
  if ((content.trim().substring(0, 11) === '!crear-deck') && (users[user])) {
    // msg = content.substring(7).trim().split(' ');
    name = content.substring(11).trim().substring(0, content.substring(11).trim().indexOf('\n')).trim().toLowerCase();
    clipboard = content.substring(12).trim().substring(content.substring(12).trim().indexOf('\n')).trim();

    firebase.database().ref().update({
      [name]: clipboard
    });

    e.message.author.openDM().then((channel, error) => {
      channel.sendMessage('Deck creado satisfactoriamente a nombre de: \'' + name + '\'');
    });

    // e.message.channel.sendMessage('Deck creado satisfactoriamente a nombre de: \'' + name + '\'');
  } else if ((content.toLowerCase().trim().substring(0, 5) === '!deck') || e.message.isPrivate) {
    let input = '';
    if (!(content.toLowerCase().trim().substring(0, 5) === '!deck') && (e.message.isPrivate)) {
      input = content.trim();
    } else if(content.toLowerCase().trim().substring(0, 15) === '!deck-compartir') {
      input = content.substring(16).trim();
      share = true;
    }
    else {
      input = content.substring(5).trim();
    }
    // const name = content.substring(5).trim();
    if (!input) {
      firebase.database().ref().once('value', (snapshot) => {
        const decks = snapshot.val();
        let msg = 'Decks disponibles:';
        _.map(decks, (value, key) => {
          msg = `${msg}\n:white_small_square:${key}`;
        });
        e.message.author.openDM().then((channel, error) => {
          channel.sendMessage(msg);
        });
        // e.message.channel.sendMessage(msg);
      });
    } else {
    var name = firebase.database().ref(input.toLowerCase().trim());
    name.once('value', (snapshot) => {
      if (snapshot.val()) {
        if (!share) {
          e.message.author.openDM().then((channel, error) => {
            channel.sendMessage(snapshot.val());
          });
        } else {
          e.message.channel.sendMessage(snapshot.val());
        }

        // e.message.channel.sendMessage(snapshot.val());
      } else {
        e.message.author.openDM().then((channel, error) => {
          channel.sendMessage('No se ha encontrado ningun deck en especifico a nombre de ' + input.toLowerCase());
        });
        // e.message.channel.sendMessage('No se ha encontrado ningun deck en especifico a nombre de ' + content.substring(5).trim().toLowerCase());
        firebase.database().ref().once('value', (snapshot) => {
          const decks = snapshot.val();
          let msg = 'Pero se han encontrado los siguientes deck con ' + input.toLowerCase() + '\n';
          let found = false;
          _.map(decks, (value, key) => {
            if (key.toLowerCase().indexOf(input.toLowerCase()) !== -1) {
              if (!found) {
                found = true;
              }
              msg = `${msg}\n:white_small_square:${key}`;
            }
          });
          if (found) {
            e.message.author.openDM().then((channel, error) => {
              channel.sendMessage(msg);
            });
            // e.message.channel.sendMessage(msg);
          }
        })
      }
    });

    }
  }
}
}

} catch (err) {
  //empty
}
});
