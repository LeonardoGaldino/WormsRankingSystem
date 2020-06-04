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
        <RankingTable></RankingTable>
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
        {this.props.idx >= 3 && <>{this.props.idx}</>}
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
    let t = await v.json()
    console.log(t);
    this.setState({
      rows: t,
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

export default App;
