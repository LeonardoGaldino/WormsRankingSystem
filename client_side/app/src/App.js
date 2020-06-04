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

  state = {
    rows: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    let v = await fetch('http://localhost:5000/ranking', {
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
                    <TableCell align="center" component="td" scope="row">{row.ranking.toFixed(2)}</TableCell>
                    <TableCell align="center" component="td" scope="row">{row.games}</TableCell>
                    <TableCell align="center" component="td" scope="row">{row.wins}</TableCell>
                    <TableCell align="center" component="td" scope="row">{row.score_avg.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </MuiTableContainer>
  }
}

class Games extends React.Component {

  state = {
    games: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    let v = await fetch('http://localhost:5000/games', {
      method: 'GET',
    });
    this.setState({
      games: await v.json(),
    });
  }

  render() {
    return <h1>Hello, world from games</h1>;
  }
}

class Game extends React.Component {

  render() {
    return <h1>Hello, world from game</h1>;
  }
}

export default App;
