import React from 'react'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import MuiTableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import dayjs from 'dayjs';

import {API_ENDPOINT} from '../env';

class Game extends React.Component {
    render() {
      let curDate = dayjs.unix(this.props.gameTs);
      
      return <MuiTableContainer style={{backgroundColor: this.props.background, marginTop: 20}} component={Paper}>
        <Table size='medium' aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className="game-table-header" align="left">
                <h2>
                  {curDate.format('DD/MM/YYYY - HH:mm')}
                </h2>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="left"><strong>Player</strong></TableCell>
              <TableCell align="center"><strong>Rounds played</strong></TableCell>
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
                <TableCell align="left" component="td" scope="entry">
                  <Chip
                    avatar={<Avatar alt="PlayerAvatar" src={API_ENDPOINT + entry.avatar_path}>{entry.name[0]}</Avatar>}
                    label={entry.name}
                  />  
                </TableCell>
                <TableCell align="center" component="td" scope="entry">{entry.rounds_played !== 0 ? entry.rounds_played : '-'}</TableCell>
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

  export default Game