const CONFIG = {
    PORT: 3000,
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
export default CONFIG;