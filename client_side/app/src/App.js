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
        {this.props.idx >= 3 && <>{this.props.idx + 1}.</>}
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
                  <TableCell align="center"><strong>Name</strong></TableCell>
                  <TableCell align="center"><strong>Ranking</strong></TableCell>
                  <TableCell align="center"><strong>Average score</strong></TableCell>
                  <TableCell align="center"><strong>Games</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.rows.map((row, idx) => (
                  <TableRow key={row.name}>
                    <RankingNumberTableCell name={row.name} idx={idx}></RankingNumberTableCell>
                    <TableCell align="center" component="td" scope="row">{row.name}</TableCell>
                    <TableCell style={{color: row.ranking >= 1500 ? 'green' : 'red'}} 
                      align="center" component="td" scope="row">
                        {row.ranking.toFixed(0)}
                    </TableCell>
                    <TableCell align="center" component="td" scope="row">
                        {row.score_avg.toFixed(0)}
                    </TableCell>
                    <TableCell align="center" component="td" scope="row">{row.games}</TableCell>
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
    pageSize: 5,
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
    return <div>
      <h1 style={{display: 'block'}}>Games</h1>
      {Object.keys(this.state.games).map(gameDate => {
        return <div key={gameDate+'div'}>
          {Object.keys(this.state.games[gameDate]).reverse().map((gameId,idx) => 
            <Game key={gameId} gameIdx={Object.keys(this.state.games[gameDate]).length - idx} gameDate={gameDate} playerEntries={this.state.games[gameDate][gameId]}></Game>
          )}
        </div>
      })}
    </div>
  }
}

class Game extends React.Component {

  render() {
    return <MuiTableContainer style={{marginTop: 10}} component={Paper}>
      <Table size='medium' aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell className="game-table-header" align="left">
              <h2>
                {`Game ${this.props.gameIdx} - ${this.props.gameDate}`}
              </h2>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="left"><strong>Name</strong></TableCell>
            <TableCell align="right"><strong>Kills</strong></TableCell>
            <TableCell align="right"><strong>Damage</strong></TableCell>
            <TableCell align="right"><strong>Self damage</strong></TableCell>
            <TableCell align="right"><strong>Score</strong></TableCell>
            <TableCell align="right"><strong>&Delta;Ranking</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.props.playerEntries.map((entry, idx) => (
            <TableRow key={entry.name}>
              <TableCell align="left" component="td" scope="entry">{entry.name}</TableCell>
              <TableCell align="right" component="td" scope="entry">{entry.kills}</TableCell>
              <TableCell align="right" component="td" scope="entry">{entry.damage}</TableCell>
              <TableCell align="right" component="td" scope="entry">{entry.self_damage}</TableCell>
              <TableCell align="right" component="td" scope="entry">{entry.score}</TableCell>
              <TableCell align="right" component="td" scope="entry">
                {parseFloat(entry.ranking_delta) !== 0.0 && (entry.ranking_delta > 0 ? 
                <ArrowUpwardIcon style={{marginRight: 3, position: 'relative', top: 6, color: 'green'}}>
                </ArrowUpwardIcon> 
                  : 
                <ArrowDownwardIcon style={{marginRight: 3, position: 'relative', top: 6, color: 'red'}}>
                </ArrowDownwardIcon>)}
                {Math.abs(entry.ranking_delta) < 10.0 && '0'}
                {Math.abs(entry.ranking_delta).toFixed(0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MuiTableContainer>;
  }
}

export default App;
