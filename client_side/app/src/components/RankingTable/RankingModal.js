import React from 'react'
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';
import InfoIcon from '@material-ui/icons/Info';

import RankingHistoryChart from './RankingHistoryChart.js'
import {API_ENDPOINT} from '../../env.js';

class RankingModal extends React.Component {

    state = {
        rankingData: null,
    }

    rankingHistoryRequestPath = '/worms/api/player/ranking_history';

    handleClose = () => {
        this.props.onModalClose(null);
        this.setState({
            rankingData: null,
        })
    }

    async fetchRankingData(){
        let url = new URL(API_ENDPOINT + this.rankingHistoryRequestPath);
        url.searchParams.append('player_name', this.props.playerName);
  
        let res = await fetch(url);
        let resJSON = await res.json();
  
        this.setState((state, _) => ({
            ...state,
            rankingData: resJSON,
        }));
    }

    render() {
        return(
            <Dialog
                maxWidth='md'
                fullWidth={true}
                open={this.props.playerName !== null}
                onEntering={this.fetchRankingData.bind(this)}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">{this.props.playerName}'s ranking history</DialogTitle>
    
                    <Divider />
    
                    <DialogContent>
                        <p style={{marginBottom: 0, marginTop: 0}}> 
                            <InfoIcon style={{position: 'relative', top: 4}} color={'primary'} fontSize={'small'}></InfoIcon> 
                            Click on a point to see game details 
                        </p>

                        <RankingHistoryChart rankingData={this.state.rankingData}></RankingHistoryChart>
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