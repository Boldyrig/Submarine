import React from 'react';
import './Team.scss';
import './../../index.css';

import socket from '../../helpers/socket';

class Team extends React.Component {
  constructor(props) {
    super();
    this.MESSAGES = props.MESSAGES;
    this.setGameState = props.setGameState;
    this.setTeams = props.setTeams;
    this.setIsJoinedState = props.setIsJoinedState;
    this.state = {
      createTeam: false,
      teams: props.teams
    };
    socket.on(this.MESSAGES.TEAM_LIST, (data) => { this.setState({ teams : data }); this.setTeams(data); });
    socket.on(this.MESSAGES.REMOVE_TEAM, (data) => data && (this.setGameState(false) || this.setIsJoinedState(false)));
    socket.on(this.MESSAGES.CREATE_TEAM, (data) => data && this.setIsJoinedState(true));
    socket.on(this.MESSAGES.JOIN_TO_TEAM, (data) => data && this.setIsJoinedState(true));
    socket.on(this.MESSAGES.LEAVE_TEAM, (data) => data && (this.setGameState(false) || this.setIsJoinedState(false)));
    socket.on(this.MESSAGES.START_GAME, (data) => data && this.setGameState(true));
    /*
          KICK_FROM_TEAM: 'KICK_FROM_TEAM', // выкинуть из команды
        */
  }

  startGame() {
    socket.emit(this.MESSAGES.START_GAME, { token : localStorage.getItem('token') });
  }

  joinToTeam(elem) {
    let roomId = elem.target.getAttribute('roomid');
    if(roomId) {
        socket.emit(this.MESSAGES.JOIN_TO_TEAM, { token: localStorage.getItem('token'), roomId });
    }
  }

  logout() {
    socket.emit(this.MESSAGES.USER_LOGOUT, { token : localStorage.getItem('token') });
  }

  createTeam() {
    socket.emit(this.MESSAGES.CREATE_TEAM, { 
      token: localStorage.getItem('token'),
      name: document.querySelector('#team__create__name').value
    });
    this.setState({
      createTeam: false
    });
  }

  removeTeam(elem) {
    //let roomId = elem.target.getAttribute('roomid');
    socket.emit(this.MESSAGES.REMOVE_TEAM, { 
      token: localStorage.getItem('token')
    });
  }

  leaveTeam(elem) {
    socket.emit(this.MESSAGES.LEAVE_TEAM, { 
      token: localStorage.getItem('token')
    });
  }

  renderCreateTeam() {
    return (
      <div className="team__create">
        <input id="team__create__name"/>
        <a href="#a" className="team__create__btn" onClick={() => this.createTeam()}>Create</a>
      </div>
    );
  }

  renderTeamList() {
    return (
      <div className="team__list">
        <h2>Team List</h2>
        <h3>Game name</h3>
        { this.renderList() }
      </div>
    );
  }

  renderList() {
    let joinedTeam = null;
    for(let teamId in this.state.teams) {
      let player = this.state.teams[teamId].players.find((player) => player.id === localStorage.getItem('id') - 0);
      if(player) joinedTeam = teamId;
    }
    return(
      <div>
        { this.state.teams ? Object.keys(this.state.teams).map(team => 
          <div className="team__lobby" key={ team }>
            <p className="team__name">{ this.state.teams[team].name } { (team === joinedTeam) ? '(joined)' : null }</p>
            { (team === localStorage.getItem('id')) ? //если капитан
              <div className="team__control">
                <a
                  href="#a"
                  onClick = { (elem) => this.removeTeam(elem) }
                  className="join__team__btn"
                  roomid={this.state.teams[team].roomId}
                >Remove</a>
                <a href="#a" className="join__team__btn game__btn" onClick = { () => this.startGame() }>Start Game</a>
              </div>
                :
              (team === joinedTeam) ? //если присоединился
              <a 
                href="#a"
                onClick = { (elem) => this.leaveTeam(elem) } 
                className="join__team__btn" 
                roomid={this.state.teams[team].roomId}
              >Leave</a> : 
              <a 
                href="#a"
                onClick = { (elem) => this.joinToTeam(elem) } 
                className="join__team__btn" 
                roomid={this.state.teams[team].roomId}
              >Join</a> }
          </div>
        ) : null }
      </div>
    );
  }

  render() {
    return (
      <div className="Team">
        <div className="main__menu">
          <a href="#a" className="create__team__btn" onClick = { () => this.setState({createTeam: true}) }>Create Team</a>
          <a href="#a" className="team__list__btn" onClick = { () => this.setState({createTeam: false}) }>Team List</a>
          <a href="#a" className="log__out" onClick = { () => this.logout() }>Log Out</a>
        </div>
      { this.state.createTeam ? this.renderCreateTeam() : this.renderTeamList() }
      </div>
    );
  }
}

export default Team;