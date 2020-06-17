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
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

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
    let res = await fetch(`${API_ENDPOINT+this.requestPath}`, {
      method: 'GET',
    });
    this.setState({
      rows: await res.json(),
    });
  }

  render() {
    return <Paper style={{marginTop: 30}} elevation={4}>
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
      </Paper>
  }
}

class Games extends React.Component {

  requestPath = '/worms/api/games'
  state = {
    games: [],
    currentPage: 0,
    numPages: 0,
    pageSize: 5,
  };

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    let res = await fetch(`${API_ENDPOINT+this.requestPath}?page=${this.state.currentPage}&page_size=${this.state.pageSize}`, {
      method: 'GET',
    });
    let data = await res.json();
    this.setState({
      games: data.games,
      numPages: data.num_pages,
    });
  }

  render() {
    return <Paper style={{marginTop: 30, paddingBottom: 20, backgroundColor: '#f5f5f5'}} elevation={3}>
      <h1 style={{paddingTop: 15, display: 'block'}}>Games</h1>
      <div>
        <InputLabel id="demo-simple-select-label">Games per page</InputLabel>
        <Select
          style={{width: 65}}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={this.state.pageSize}
          onChange={(event) => {
              event.persist()
              this.setState({
                ...this.state,
                pageSize: parseInt(event.target.value),
                currentPage: 0,
              }, this.fetchData);
            }
          }
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
        </Select>
      </div>
      <div>
        <IconButton
            onClick={() => {
              this.setState((state, props) => ({
                ...state,
                currentPage: Math.max(0, state.currentPage - 1)
              }), this.fetchData)
            }}
            aria-label="previous page"
          >
            <KeyboardArrowLeft />
        </IconButton>

        <IconButton
          onClick={() => {
            this.setState((state, props) => ({
              ...state,
              currentPage: Math.min(state.currentPage + 1, state.numPages - 1)
            }), this.fetchData)
          }}
          aria-label="next page"
        >
          <KeyboardArrowRight />
        </IconButton>
      </div>
      <div>

      <div>
        <span style={{color: "rgba(0,0,0,0.54)", fontWeight: 400, fontSize: 16}}>
          {`${this.state.currentPage+1}/${this.state.numPages}`}
        </span>
      </div>

      </div>
      {Object.keys(this.state.games).map(gameDate => {
        return <div style={{width: '95%', margin: 'auto'}} key={gameDate+'div'}>
          {Object.keys(this.state.games[gameDate]).reverse().map((gameId,idx) => 
            <Game key={gameId} gameIdx={Object.keys(this.state.games[gameDate]).length - idx}
             gameDate={gameDate} playerEntries={this.state.games[gameDate][gameId]}>
             </Game>
          )}
        </div>
      })}
    </Paper>
  }
}

class Game extends React.Component {

  render() {
    return <MuiTableContainer style={{marginTop: 20}} component={Paper}>
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
            <TableCell align="center"><strong>Kills</strong></TableCell>
            <TableCell align="center"><strong>Damage</strong></TableCell>
            <TableCell align="center"><strong>Self damage</strong></TableCell>
            <TableCell align="center"><strong>Score</strong></TableCell>
            <TableCell align="center"><strong>&Delta;Ranking</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.props.playerEntries.map((entry, idx) => (
            <TableRow key={entry.name}>
              <TableCell align="left" component="td" scope="entry">{entry.name}</TableCell>
              <TableCell align="center" component="td" scope="entry">{entry.kills}</TableCell>
              <TableCell align="center" component="td" scope="entry">{entry.damage}</TableCell>
              <TableCell align="center" component="td" scope="entry">{entry.self_damage}</TableCell>
              <TableCell align="center" component="td" scope="entry">{entry.score}</TableCell>
              <TableCell align="center" component="td" scope="entry">
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
