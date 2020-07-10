import React from 'react'
import Chart from 'chart.js'
import CachedSharpIcon from '@material-ui/icons/CachedSharp';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

import GameModal from '../Games/GameModal.js';

class RankingHistoryChart extends React.Component {

    state = {
        selectedGame: null,
        processedRankingData: null,
        gamesRange: [0, 0],
    }
    renderedChart = null;

    closeModal() {
        this.renderedChart = null;
        this.setState({
            selectedGame: null,
            processedRankingData: null,
        });
    }

    changeSelectedGame(changeForward) {
        let currentIndex = this.state.selectedGame.index;
        let newIndex = changeForward ? currentIndex + 1 : currentIndex - 1;
        // Point 0 is not a game, is the initial ranking
        newIndex = Math.max(Math.min(newIndex, this.state.processedRankingData.length - 1), 1);

        if(newIndex !== currentIndex) {
            this.setState((state,_) => ({
                ...state,
                selectedGame: {
                    index: newIndex,
                    id: state.processedRankingData[newIndex].gameId,
                }
            }));
        }
    }

    processRankingData() {
        let rankingData = this.props.rankingData;
        let currentRanking = rankingData.current_ranking;

        let rankings = new Array(rankingData.history.length + 1);
        rankings[rankingData.history.length] = {
            gameId: rankingData.history[rankingData.history.length - 1].game_id,
            x: new Date(rankingData.history[rankingData.history.length - 1].game_ts * 1000),
            y: currentRanking,
        }

        for(let idx = rankingData.history.length - 1 ; idx >= 0 ; --idx) {
            let gameId = null;
            // Project start date
            let gameDate = Date.parse('01 Jun 2020 00:00:00 GMT-03:00');
            if(idx > 0) {
                gameId = rankingData.history[idx-1].game_id;
                let gameTs = rankingData.history[idx-1].game_ts;
                gameDate = new Date(gameTs*1000);
            }

            currentRanking -= rankingData.history[idx].delta_ranking;

            rankings[idx] = {
                gameId: gameId,
                x: gameDate,
                y: currentRanking,
            }
        }

        this.setState((state, _) => ({
            ...state,
            processedRankingData: rankings,
        }));
    }

    componentDidUpdate() {
        // No canvas rendered: no work to be done
        if(this.props.rankingData === null) {
            return;
        }
        if(this.state.processedRankingData === null) {
            this.processRankingData();
            this.setState((state, props) => ({
                ...state,
                gamesRange: [0, props.rankingData.history.length],
            }));
            return;
        }

        let processedRankingData = this.state.processedRankingData;
        let rankingDataWindow = processedRankingData.slice(this.state.gamesRange[0], this.state.gamesRange[1]+1);

        let lowestRanking = rankingDataWindow.length > 0 ? rankingDataWindow[0].y : 1500;
        let highestRanking = rankingDataWindow.length > 0 ? rankingDataWindow[0].y : 1500;
        rankingDataWindow.forEach(rankingPoint => {
            lowestRanking = Math.min(lowestRanking, rankingPoint.y);
            highestRanking = Math.max(highestRanking, rankingPoint.y);
        });

        let ctx = document.getElementById('ranking-history-chart');
        ctx.style.backgroundColor = 'rgba(30,30,30,1)';

        let getBorderColor = (ranking) => {
            if(ranking.y === highestRanking) {
                return 'rgba(0,0,255,1)';
            } else if(ranking.y === lowestRanking) {
                return 'rgba(255,0,0,1)'
            } else {
                return 'rgba(236,245,66,1)';
            }
        }

        if(this.renderedChart !== null) {
            this.renderedChart.destroy();
        }
        
        this.renderedChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    fill: false,
                    label: 'Ranking',
                    data: rankingDataWindow,
                    backgroundColor: 'rgba(220,220,220,1)',
                    borderColor: 'rgba(236,245,66,1)',
                    pointBorderColor: rankingDataWindow.map(getBorderColor),
                    borderWidth: .8,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'series',
                        time: {
                            unit: 'year',
                            displayFormats: {
                                year: 'D/M/YY',
                            }
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: false
                        }
                    }],
                },
                onClick: (_, elems) => {
                    if(elems.length > 0) {
                        let index = elems[0]._index + this.state.gamesRange[0];
                        if(index > 0) {
                            this.setState((state,_) => ({
                                selectedGame: {
                                    index: index,
                                    id: state.processedRankingData[index].gameId,
                                },
                            }));
                        }
                    }
                }
            }
        });


    }

    render(){
        if(this.props.rankingData !== null) {
            return <div>
                <canvas id="ranking-history-chart"></canvas>

                <GameModal gameId={this.state.selectedGame ? this.state.selectedGame.id : null}
                    changeSelectedGameCallback={this.changeSelectedGame.bind(this)}
                    closeModalCallback={this.closeModal.bind(this)}
                >
                </GameModal>

                <div style={{marginTop: 10, textAlign: 'center'}}>
                    <Typography id="range-slider" gutterBottom>
                        Games date range
                    </Typography>
                    <Slider
                        value={this.state.gamesRange}
                        max={this.props.rankingData.history.length}
                        onChange={(_, range) => {
                                this.setState((state, _) => ({
                                    ...state,
                                    gamesRange: range,
                                }));
                            }
                        }
                        valueLabelDisplay="auto"
                        aria-labelledby="range-slider"
                        getAriaValueText={() => 'kappa'}
                    />
                </div>
            </div>
        } else {
            return <div style={{textAlign: 'center'}}>
                    <CachedSharpIcon className='icon-spinner' fontSize='large' />
                </div>
        }
    }
}

export default RankingHistoryChart;