import React from 'react';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';

import CachedSharpIcon from '@material-ui/icons/CachedSharp';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

import Game from './Game';
import {API_ENDPOINT} from '../../env.js';

class GameModal extends React.Component {
    
    state = {
        gameData: null,
    }
    gameRequestPath = '/worms/api/game';

    async fetchGameData() {
        if(this.props.gameId !== null ) {
            let url = new URL(API_ENDPOINT + this.gameRequestPath);
            url.searchParams.append('game_id', this.props.gameId);
    
            let res = await fetch(url);
            let resJSON = await res.json();
    
            this.setState((state, _) => ({
                ...state,
                gameData: resJSON,
            }));
        }
    }

    componentDidUpdate() {
        if(this.state.gameData === null || this.props.gameId !== this.state.gameData.game_id) {
            this.fetchGameData();
        }
    }

    render() {
        return <Dialog
            PaperProps={{style: {backgroundColor: '#f5f5f5'}}}
            maxWidth='md'
            fullWidth={true}
            open={this.props.gameId !== null}
            onEntering={this.fetchGameData.bind(this)}
            onClose={this.props.closeModalCallback}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">

                <DialogTitle id="alert-dialog-title">Game {(this.state.gameData !== null ? this.state.gameData.game_id : "...")}</DialogTitle>

                <Divider />

                <DialogContent style={{marginBottom: 20}}>
                    {this.state.gameData !== null && 
                    <Game gameTs={this.state.gameData.game_ts} playerEntries={this.state.gameData.players_data}>
                    </Game>}
                    {this.state.gameData === null && 
                    <div style={{textAlign: 'center', marginTop: 20}}>
                        <CachedSharpIcon className='icon-spinner' fontSize='large' />
                    </div>}
                </DialogContent>

                <Divider />
                
                <DialogActions>
                    <Button onClick={() => this.props.changeSelectedGameCallback(false)} color="primary" autoFocus>
                    <NavigateBefore></NavigateBefore> Previous
                    </Button>
                    <Button onClick={() => this.props.changeSelectedGameCallback(true)} color="primary" autoFocus>
                        Next <NavigateNext></NavigateNext>
                    </Button>
                    <Button onClick={this.props.closeModalCallback} color="primary" autoFocus>
                        Close
                    </Button>
                </DialogActions>

            </Dialog>
    }
}

export default GameModal;