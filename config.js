const CONFIG = {
    PORT: 9000,

    DATABASE: {
        HOST: '',
        NAME: 'submarine.db',
        USER: '',
        PASS: ''
    },

    // список всех триггеров в системе
    TRIGGERS: {
        GET_USER_BY_TOKEN: 'GET_USER_BY_TOKEN',
        GET_ROOMID_BY_USERID: 'GET_ROOMID_BY_USERID',
        GET_TEAM: 'GET_TEAM',
        GET_TEAMS: 'GET_TEAMS',
        GET_USER_BY_ID: 'GET_USER_BY_ID'
    },

    // список всех событий в системе
    EVENTS: {
        DISCONNECT: 'DISCONNECT'
    },

    // список всех сокетных сообщений в системе
    MESSAGES: {
        // about user
        USER_LOGIN: 'USER_LOGIN',
        USER_REGISTRATION: 'USER_REGISTRATION',
        USER_LOGOUT: 'USER_LOGOUT',
        // about chat
        NEW_MESSAGE: 'NEW_MESSAGE', // новое сообщение в чат
        // about team
        TEAM_LIST: 'TEAM_LIST', // список комнат
        CREATE_TEAM: 'CREATE_TEAM',
        REMOVE_TEAM: 'REMOVE_TEAM',
        JOIN_TO_TEAM: 'JOIN_TO_TEAM',
        LEAVE_TEAM: 'LEAVE_TEAM',
        KICK_FROM_TEAM: 'KICK_FROM_TEAM', // выкинуть из команды
        // about game
        START_GAME: 'START_GAME',
    }
};

module.exports = CONFIG;