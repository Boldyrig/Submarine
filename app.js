const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);

const CONFIG = require('./config');
const { PORT, TRIGGERS, EVENTS, MESSAGES, DATABASE } = CONFIG; // конфига

// классы модулей
const Mediator = require('./application/modules/Mediator'); // медиатор
const DB = require('./application/modules/db/DB'); // базонька с данными
const Common = require('./application/modules/common/Common');
const UserManager = require('./application/modules/userManager/UserManager');
const ChatManager = require('./application/modules/chatManager/ChatManager');
const TeamManager = require('./application/modules/teamManager/TeamManager');
const GameManager = require('./application/modules/gameManager/GameManager');

// подключение модулей
const mediator = new Mediator({ TRIGGERS, EVENTS });
const db = new DB(DATABASE);
const common = new Common;

new UserManager({ mediator, io, MESSAGES, db, common });
new ChatManager({ mediator, io, MESSAGES, db, common });
new TeamManager({ mediator, io, MESSAGES, db, common });
new GameManager({ mediator, io, MESSAGES, db, common });

io.on('connection', socket => {
	console.log('connected', socket.id);
	socket.on('disconnect', () => console.log('disconnect', socket.id));
});

// router
const Router = require('./application/router/Router');
const router = new Router({ mediator });
app.use(express.static(__dirname + '/public'));
app.use('/', router);

function deinitModules() {
	db.destructor();
	setTimeout(() => process.exit(), 500);
}

server.listen(PORT, () => console.log(`Port is ${PORT}`));

process.on('SIGINT', deinitModules); // CTRL + C