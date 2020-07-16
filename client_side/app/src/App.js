import React from 'react';
import Container from '@material-ui/core/Container';

import './App.css';
import RankingTable from './components/RankingTable/RankingTable.js';
import Games from './components/Games/Games.js';
import HelpSection from './components/Help/HelpSection.js';

function App() {
  return (
    <div className="App">
      <Container maxWidth={'md'}>
        <h1 className="mainHeader" style={{display: 'inline-block', marginRight: 5}}>Worms Ranking System</h1>
        <img className="mainWormsImage" style={{height: 100, position: 'relative'}} src="./worms.png"></img>
        <RankingTable></RankingTable>
        <Games></Games>
        <HelpSection></HelpSection>
      </Container>
    </div>
  );
}

export default App;
