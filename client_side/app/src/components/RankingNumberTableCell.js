import React from 'react'
import StarIcon from '@material-ui/icons/Star';
import TableCell from '@material-ui/core/TableCell';

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



export default RankingNumberTableCell