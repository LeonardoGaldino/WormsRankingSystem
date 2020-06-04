import React from 'react';
import './App.css';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

function App() {
  return (
    <div className="App">
      <RankingTable></RankingTable>
      <header className="App-header">
      </header>
    </div>
  );
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
    let t = await v.json()
    console.log(t);
    this.setState({
      rows: t,
    });
  }

  render() {
    return <TableContainer component={Paper}>
            <Table size='medium' aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Nome</TableCell>
                  <TableCell align="center">Ranking</TableCell>
                  <TableCell align="center">Games</TableCell>
                  <TableCell align="center">Vitórias</TableCell>
                  <TableCell align="center">Score médio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell component="th" scope="row">{row.name}</TableCell>
                    <TableCell component="th" scope="row">{row.ranking.toFixed(2)}</TableCell>
                    <TableCell component="th" scope="row">{row.games}</TableCell>
                    <TableCell component="th" scope="row">{row.wins}</TableCell>
                    <TableCell component="th" scope="row">{row.score_avg.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
  }
}

export default App;
