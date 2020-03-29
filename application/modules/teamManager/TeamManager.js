const BaseManager = require('../BaseManager');
const Player = require('./Player');

class TeamManager extends BaseManager {
    constructor(options) {
        super(options);

        this.ROLE = {
            CAPTAIN: 'captain',
            SAILOR: 'sailor' // морячок
        };
        this.teams = {};
        if (!this.io) return;
        this.io.on('connection', socket => {
            socket.on(this.MESSAGES.CREATE_TEAM, data => this.createTeam(data, socket));
            socket.on(this.MESSAGES.REMOVE_TEAM, data => this.removeTeam(data, socket));
            socket.on(this.MESSAGES.JOIN_TO_TEAM, data => this.joinToTeam(data, socket));
            socket.on(this.MESSAGES.LEAVE_TEAM, data => this.leaveTeam(data, socket));
            socket.on(this.MESSAGES.KICK_FROM_TEAM, data => this.kickFromTeam(data));
            socket.on(this.MESSAGES.TEAM_LIST, () => this.teams);
        });
        // настроить триггеры
        this.mediator.set(this.TRIGGERS.GET_TEAM, (id) => this.getTeam(id));
        this.mediator.set(this.TRIGGERS.GET_TEAMS, () => this.getTeams());
        this.mediator.set(this.TRIGGERS.GET_ROOMID_BY_USERID, (data) => this.getRoomIdByUserId(data));
        // настроить события
        this.mediator.subscribe(this.EVENTS.DISCONNECT, data => this.disconnect(data));
    }

    /*        */
    /* EVENTS */
    /*        */

    disconnect(data) {
        let user = this.mediator.get(this.TRIGGERS.GET_USER_BY_TOKEN, data);
        if(user) {
            let team = this.getTeam(user.id);
            if(team && this.isCaptain(team, user.id)) { // если капитан команды
                delete this.teams[user.id];
                this.io.emit(this.MESSAGES.LEAVE_TEAM, true);
                this.io.emit(this.MESSAGES.TEAM_LIST, this.teams);
                return;
            }
            let teamId = '';
            for(let key in this.teams) {
                if(this.teams[key].players.find(player => user.id == player.id)){
                    teamId = key;
                }
            }
            if(teamId) {
                this.deleteFromTeam(user.id, teamId);
            }
        }
    }

    /*          */
    /* TRIGGERS */
    /*          */

    getTeams() {
        return this.teams;
    }

    getRoomIdByUserId(id) {
        let team = null;
        for(let teamId in this.teams) {
            if(this.teams[teamId].players.find(player => id == player.id)){
                team = teamId;
            }
        }
        return team ? this.teams[team].roomId : null;
    }

    /*       */
    /* LOGIC */
    /*       */

    getTeam(id) {
        for (let key in this.teams) {
            if (this.teams[key].players.find(player => player.id === id)) {
                return this.teams[key];
            }
        }
        return null;
    }

    isCaptain(team, captainId) {
        return team.players.find(
            player => player.role === this.ROLE.CAPTAIN && player.id === captainId
        );
    }

    deleteEmptyTeams() {
        for(let teamId in this.teams) {
            if(this.teams[teamId].players.length === 0) {
                delete this.teams[teamId];
            }
        }
    }

    getTeamIdByName(name) {
        let teamId = Object.keys(this.teams).find(key => this.teams[key].name === name);
        return teamId ? teamId : null;
    }

    getTeamIdByRoomId(roomId) {
        let teamId = Object.keys(this.teams).find(key => this.teams[key].roomId === roomId);
        return teamId ? teamId : null;
    }

    deleteFromTeam(playerId, teamId) {
        let players = this.teams[teamId].players;
        for(let i = 0; i < players.length; i ++) {
            if(players[i].id === playerId) {
                this.teams[teamId].players.splice(i, 1);
                return;
            }
        }
    }

    deleteUserFromAllTeams(user, socket) {
        for(let teamId in this.teams) {
            let player = this.teams[teamId].players.find(player => player.id === user.id);
            if(player) {
                socket.leave(this.teams[teamId].roomId);
                if(player.role === this.ROLE.CAPTAIN){
                    delete this.teams[teamId];
                    continue;
                }
                this.deleteFromTeam(player.id, teamId);
            }
        }
        this.deleteEmptyTeams();
    }

    joinToTeam(data, socket) {
        const { roomId } = data;
        const user = this.mediator.get(this.TRIGGERS.GET_USER_BY_TOKEN, data);
        if(user) {
            this.deleteUserFromAllTeams(user, socket);
            const teamId = this.getTeamIdByRoomId(roomId);
            socket.join(roomId);
            this.teams[teamId].players.push(new Player(user.id, user.name, this.ROLE.SAILOR));
            socket.emit(this.MESSAGES.JOIN_TO_TEAM, true);
            this.io.emit(this.MESSAGES.TEAM_LIST, this.teams);
            return;
        }
        socket.emit(this.MESSAGES.JOIN_TO_TEAM, false);
    }

    leaveTeam(data, socket) {
        const user = this.mediator.get(this.TRIGGERS.GET_USER_BY_TOKEN, data);
        if(user) {
            this.deleteUserFromAllTeams(user, socket);
            socket.emit(this.MESSAGES.LEAVE_TEAM, true);
            this.io.emit(this.MESSAGES.TEAM_LIST, this.teams);
            return;
        }
        socket.emit(this.MESSAGES.LEAVE_TEAM, false);
    }

    removeTeam(data, socket) {
        const user = this.mediator.get(this.TRIGGERS.GET_USER_BY_TOKEN, data);
        if (user) {
            const team = this.teams[user.id];
            if (team && 
                team.players.find(
                    player => player.id === user.id && player.role === this.ROLE.CAPTAIN
                )
            ) { // если капитан команды
                // команде сказать, что команда удалена
                this.io.in(team.roomId).emit(this.MESSAGES.REMOVE_TEAM, true);
                // всю команду выкинуть из комнаты
                if(this.io.sockets.adapter.rooms[team.roomId]) {
                    let sockets = this.io.sockets.adapter.rooms[team.roomId].sockets;// object{ socketID: true/false }
                    for(let socketId in sockets) {
                        this.io.sockets.connected[socketId].leave(team.roomId);
                    }
                }
                delete this.teams[user.id];
                this.io.emit(this.MESSAGES.TEAM_LIST, this.teams);
                return;
            }
        }
        socket.emit(this.MESSAGES.REMOVE_TEAM, false);
    }

    createTeam(data, socket) {
        const { name } = data;
        const user = this.mediator.get(this.TRIGGERS.GET_USER_BY_TOKEN, data);
        if (name && user) {
            if(this.teams[user.id]) { //если уже создал свою команду
                socket.emit(this.MESSAGES.CREATE_TEAM, false);
                return;
            }
            this.deleteUserFromAllTeams(user, socket);
            const roomId = this.common.getRoomId();
            this.teams[user.id] = { 
                name,
                players: [new Player(user.id, user.name, this.ROLE.CAPTAIN)],
                roomId
            };
            socket.join(roomId);
            this.io.emit(this.MESSAGES.TEAM_LIST, this.teams);
            socket.emit(this.MESSAGES.CREATE_TEAM, true);
            return;
        }
        socket.emit(this.MESSAGES.CREATE_TEAM, false);
    }

    kickFromTeam(data) {
        const { kickId } = data;
        const user = this.mediator.get(this.TRIGGERS.GET_USER_BY_TOKEN, data);
        if (user && kickId) {
            const team = this.getTeam(user.id);
            if (team && this.isCaptain(team, user.id)) {
                // удалить из команды
                this.deleteFromTeam(kickId, user.id);
                // взять удаляемого
                const kicked = this.mediator.get(this.TRIGGERS.GET_USER_BY_ID, kickId);
                if (kicked) { // если выкидываемый есть
                    // выкинуть его из комнаты
                    let sock = this.io.sockets.connected[kicked.socketId];
                    sock.leave(team.roomId);
                    sock.emit(this.MESSAGES.KICK_FROM_TEAM, true);
                }
                // обновить команду
                this.io.emit(this.MESSAGES.TEAM_LIST, this.teams);
            }
        }
        return false;
    }
}

module.exports = TeamManager;