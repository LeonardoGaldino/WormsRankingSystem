import React from 'react'
import MyChart from './MyChart.js'

import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';

class RankingModal extends React.Component {

    handleClose = () => {
        this.props.methd(null);
    }

    render() {
        return(
            <Dialog
                maxWidth='md'
                fullWidth={true}
                open={this.props.name !== null}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">{this.props.name}'s ranking history</DialogTitle>
    
                    <DialogContent>
                        <MyChart player={this.props.name}></MyChart>
                    </DialogContent>
    
                    <Divider />
                    
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary" autoFocus>
                            Close
                        </Button>
                    </DialogActions>
              </Dialog>
        )
    }

}

export default RankingModal