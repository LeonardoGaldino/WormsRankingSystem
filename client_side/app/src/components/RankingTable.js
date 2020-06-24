import React from 'react'
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow'
import RankingNumberTableCell from './RankingNumberTableCell.js'
import RankingModal from './RankingModal.js'

import {API_ENDPOINT , API_PORT , API_URL} from '../env.js'


class RankingTable extends React.Component {
  
    requestPath = '/worms/api/ranking'
  
    state = {
      rows: [],
      selectedPlayerName: null,
    };
  
    componentDidMount() {
      this.fetchData();
    }
  
    async fetchData() {
      let res = await fetch(`${API_ENDPOINT+this.requestPath}`, {
        method: 'GET',
      });
      let rows = await res.json();
      this.setState((state, props) => ({
        ...state,
        rows: rows,
      }));
    }

    changeModalNameState(playerName){
      this.setState((state, props) => ({
        ...state,
        selectedPlayerName: playerName,
      }))
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
                    <TableRow key={row.name} className = "playerTableRow" onClick = {() => this.changeModalNameState(row.name)}>
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
              <RankingModal
                  methd = {this.changeModalNameState.bind(this)}
                  name={this.state.selectedPlayerName}
                >
              </RankingModal>
        </Paper>
    }
}

export default RankingTable