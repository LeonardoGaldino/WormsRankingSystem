import React from 'react';
import HelpIcon from '@material-ui/icons/Help';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

class HelpSection extends React.Component {
    state = {
        helpModalOpen: false,
    }
    
    dialogContentRef = React.createRef();

    changeModal(openState) {
        this.setState({
            helpModalOpen: openState,
        });
    }

    typeSetEquations() {
        window.MathJax.typeset([this.dialogContentRef.current]);
    }

    render() {
        return <>
                <div className="help-icon-div">
                    <HelpIcon color="inherit" fontSize="inherit" onClick={() => this.changeModal(true)}></HelpIcon>
                </div>

                <Dialog
                maxWidth='md'
                fullWidth={true}
                open={this.state.helpModalOpen}
                onClose={() => this.changeModal(false)}
                onEntered={this.typeSetEquations.bind(this)}>
                    <DialogTitle><strong>Worms Ranking System</strong></DialogTitle>
    
                    <DialogContent ref={this.dialogContentRef}>
                        <h4>This is a ranking system built for Worms Armageddon v3.7.2.1.</h4>
                        <p>The data here displayed is collected by a program that reads through the game process' memory and is then sent to the server.</p>
                        <p>The server, in turn, computes each player score and ranking change and saves everything into a database.</p>
                        <p className="help-section-paragraph"> <strong> Score measures how well a player did in a given game and is calculated as: </strong> </p>
                        {"\\[ score = { 3 * \\text{ } kills + { damage \\over 10 } - { self damage \\over 10 } } \\]"}
                        <p className="help-section-paragraph"> <strong> Δranking is the amount of change in a player's ranking after a given game and is calculated as: </strong> </p>
                        {"\\[ Δranking = { (score_{player} - score_{game}) * \\text{ } rounds_{weight} * \\text{ } \\Big({Ranking_{player} \\over Ranking_{game}}\\Big)^2} \\]"}
                        <div style={{textAlign: 'center', marginTop: 10, marginBottom: 10}}>
                            <p className="help-section-paragraph">
                                <strong>where:</strong>
                            </p>
                        </div>
                        {"\\[ score_{game} = \\text{average score of all players in a given game} \\]"}
                        {"\\[ ranking_{game} = \\text{average ranking of all players in a given game} \\]"}
                        {"\\[ rounds_{weight} = { b ^ {(rounds_{player} - rounds_{game})} } \\]"}
                        <div style={{textAlign: 'center', marginTop: 10, marginBottom: 10}}>
                            <p className="help-section-paragraph">
                                <strong>where:</strong>
                            </p>
                        </div>
                        {"\\[ rounds_{player} = \\text{rounds played by the player in a given game} \\]"}
                        {"\\[ rounds_{game} = \\text{average rounds played by all player in a given game} \\]"}
                        {"\\[ b = { \\text{0.9 if } rounds_{player} > rounds_{game} \\text{ or 0.75 otherwise} } \\]"}

                    </DialogContent>
    
                    <Divider />
                    
                    <DialogActions>
                        <Button onClick={() => this.changeModal(false)} color="primary" autoFocus>
                            Close
                        </Button>
                    </DialogActions>
              </Dialog>
            </>;
    }
}

export default HelpSection;