const BaseManager = require('../BaseManager');

class GameManager extends BaseManager {
    constructor(options) {
        super(options);
        if (!this.io) return;
        this.io.on('connection', socket => {
            socket.on(this.MESSAGES.START_GAME, (data) => data && this.startGame(data, socket));
        });
    }

    startGame(data, socket) {
        const user = this.mediator.get(this.TRIGGERS.GET_USER_BY_TOKEN, data);
        if (user) {
            const team = this.mediator.get(this.TRIGGERS.GET_TEAM, user.id);
            if (user.name === team.name) { // если капитан команды (название команды - id командира)
                let roomId = this.mediator.get(this.TRIGGERS.GET_ROOMID_BY_USERID, user.id);
                return this.io.in(roomId).emit(this.MESSAGES.START_GAME, true); // отправить сообщение о начале игры команде
            }
        }
        socket.emit(this.MESSAGES.START_GAME, false);
    }
}

module.exports = GameManager;