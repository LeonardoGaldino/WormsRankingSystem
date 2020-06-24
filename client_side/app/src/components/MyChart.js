import React from 'react'
import Chart from 'chart.js'
import CachedSharpIcon from '@material-ui/icons/CachedSharp';

import {API_ENDPOINT , API_PORT , API_URL} from '../env.js'

class MyChart extends React.Component {

    state = {
        dataLoaded: false,
    }
    dbRequestPath = '/worms/api/player/ranking_history';


    async dbRequest(playerName){
      let url = API_ENDPOINT + this.dbRequestPath + '?player_name=' + playerName
      let res = await fetch(url);
      let resJson = await res.json()
      return resJson
    }

    componentDidMount(){
        var dbResponse = (this.dbRequest(this.props.player)).then(
            (dbResponse) => {
                this.setState({
                    dataLoaded: true,
                }, () => {
                    var ctx = document.getElementById('myChart');
                    ctx.style.backgroundColor = 'rgba(30,30,30,1)'
                    let currentRating = dbResponse.current_ranking;
                    let xLabels = ['']
                    let dataArray = []
                    let mostRatedPoint = false
                    let bgColor = 'rgba(220,220,220,1)'
                    let borderColorArray = []
                    let mostRatedPosition = 1500
    
                    for(let game of dbResponse['history']){
                        currentRating += game.delta_ranking
                        if(currentRating > mostRatedPosition){
                            mostRatedPosition = currentRating
                        }
                    }
    
                    if(currentRating == mostRatedPosition){
                        borderColorArray.push('rgba(255,0,0,1)')
                        mostRatedPoint = true
                    }
                    else{
                        borderColorArray.push('rgba(236, 245, 66, 1)')
                    }
    
                    let i = 1;
                    for(let game of dbResponse['history'].reverse()){
                        currentRating -= game.delta_ranking
                        dataArray.push(currentRating)
                        if((currentRating == mostRatedPosition) && (!mostRatedPoint)){
                            borderColorArray.push('rgba(255,0,0,1)')
                            mostRatedPoint = true
                        }
                        else{
                            borderColorArray.push('rgba(236,245,66,1)')
                        }
                        let date = new Date(game['game_ts']*1000)
                        let formattedDate = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
                        xLabels.push(formattedDate)
                        i++;
                    }
                    dataArray = dataArray.reverse();
                    xLabels = xLabels.reverse();
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: xLabels,
                            datasets: [{
                                fill: false,
                                label: 'Ranking',
                                data: dataArray,
                                backgroundColor: bgColor,
                                borderColor: 'rgba(236,245,66,1)',
                                pointBorderColor: borderColorArray,
                                borderWidth: .5,
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: false
                                    }
                                }],
                            }
                        }
                    });
                });
            }
        )
    }

    render(){
        return (this.state.dataLoaded ?
                <canvas id="myChart"></canvas>
                :
                <div style={{textAlign: 'center'}}>
                    <CachedSharpIcon className='icon-spinner' fontSize='large' />
                </div>
        )
    }
}

export default MyChart