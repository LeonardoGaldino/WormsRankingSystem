import React from 'react';
import './App.css';
import Container from '@material-ui/core/Container';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import MuiTableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import StarIcon from '@material-ui/icons/Star';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

// TODO: use dotenv and webpack to correctly set environment parameters
const API_URL = 'http://localhost';
const API_PORT = 5000;
const API_ENDPOINT = `${API_URL}:${API_PORT}`;

function App() {
  return (
    <div className="App">
      <Container>
        <h1 style={{display: 'inline-block'}}>Worms Ranking System</h1>
        <img style={{height: 100, position: 'relative', top: 20, marginLeft: 5}} src="./worms.png"></img>
        <RankingTable></RankingTable>
        <h1>Games</h1>
        <Games></Games>
      </Container>
    </div>
  );
}

class RankingNumberTableCell extends React.Component {

  render () {
    return <TableCell align="center" component="td" scope="row">
        {this.props.idx === 0 && <StarIcon style={{ position: 'relative', top: 5, color: 'yellow' }}></StarIcon>}
        {this.props.idx === 1 && <StarIcon style={{ position: 'relative', top: 5, color: 'silver' }}></StarIcon>}
        {this.props.idx === 2 && <StarIcon style={{ position: 'relative', top: 5, color: 'brown' }}></StarIcon>}
        {this.props.idx >= 3 && <>{this.props.idx}.</>}
      </TableCell>;
  }
}

class RankingTable extends React.Component {
  
  requestPath = '/worms/api/ranking'
  state = {
    rows: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    let v = await fetch(`${API_ENDPOINT+this.requestPath}`, {
      method: 'GET',
    });
    this.setState({
      rows: await v.json(),
    });
  }

  render() {
    return <MuiTableContainer component={Paper}>
            <Table size='medium' aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center"><strong>#</strong></TableCell>
                  <TableCell align="center"><strong>Nome</strong></TableCell>
                  <TableCell align="center"><strong>Ranking</strong></TableCell>
                  <TableCell align="center"><strong>Games</strong></TableCell>
                  <TableCell align="center"><strong>Vitórias</strong></TableCell>
                  <TableCell align="center"><strong>Score médio</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.rows.map((row, idx) => (
                  <TableRow key={row.name}>
                    <RankingNumberTableCell name={row.name} idx={idx}></RankingNumberTableCell>
                    <TableCell align="center" component="td" scope="row">{row.name}</TableCell>
                    <TableCell style={{color: row.ranking >= 0 ? 'green' : 'red'}} 
                      align="center" component="td" scope="row">
                        {row.ranking.toFixed(2)}
                    </TableCell>
                    <TableCell align="center" component="td" scope="row">{row.games}</TableCell>
                    <TableCell align="center" component="td" scope="row">{row.wins}</TableCell>
                    <TableCell style={{color: row.score_avg >= 0 ? 'green' : 'red'}} 
                      align="center" component="td" scope="row">
                        {row.score_avg.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </MuiTableContainer>
  }
}

class Games extends React.Component {

  requestPath = '/worms/api/games'
  state = {
    games: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    let v = await fetch(`${API_ENDPOINT+this.requestPath}`, {
      method: 'GET',
    });
    this.setState({
      games: await v.json(),
    });
  }

  render() {
    return Object.keys(this.state.games).map(gameDate => {
      return <div key={gameDate+'div'}>
        <h3>{gameDate}</h3>
        {Object.keys(this.state.games[gameDate]).reverse().map(gameId => 
          <Game key={gameId} playerEntries={this.state.games[gameDate][gameId]}></Game>
        )}
      </div>;
    });
  }
}

class Game extends React.Component {

  render() {
    return <MuiTableContainer style={{marginTop: 10}} component={Paper}>
      <Table size='medium' aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center"><strong>Nome</strong></TableCell>
            <TableCell align="center"><strong>Posição</strong></TableCell>
            <TableCell align="center"><strong>Kills</strong></TableCell>
            <TableCell align="center"><strong>Suicídios</strong></TableCell>
            <TableCell align="center"><strong>Score</strong></TableCell>
            <TableCell align="center"><strong>&Delta;Ranking</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.props.playerEntries.map((entry, idx) => (
            <TableRow key={entry.name}>
              <TableCell align="center" component="td" scope="entry">{entry.name}</TableCell>
              <TableCell align="center" component="td" scope="entry">{entry.position}°</TableCell>
              <TableCell align="center" component="td" scope="entry">{entry.kills}</TableCell>
              <TableCell align="center" component="td" scope="entry">{entry.suicides}</TableCell>
              <TableCell align="center" component="td" scope="entry">{entry.score}</TableCell>
              <TableCell align="center" component="td" scope="entry">
                {parseFloat(entry.ranking_delta) !== 0.0 && (entry.ranking_delta > 0 ? 
                <ArrowUpwardIcon style={{marginRight: 3, position: 'relative', top: 6, color: 'green'}}>
                </ArrowUpwardIcon> 
                  : 
                <ArrowDownwardIcon style={{marginRight: 3, position: 'relative', top: 6, color: 'red'}}>
                </ArrowDownwardIcon>)}
                {Math.abs(entry.ranking_delta) < 10.0 && 0}
                {Math.abs(entry.ranking_delta).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MuiTableContainer>;
  }
}

export default App;
