(this.webpackJsonpapp=this.webpackJsonpapp||[]).push([[0],{100:function(e,a,t){},108:function(e,a,t){"use strict";t.r(a);var n=t(0),r=t.n(n),l=t(9),s=t.n(l),i=(t(99),t(157)),c=(t(100),t(21)),o=t.n(c),m=t(13),u=t(26),g=t(15),p=t(16),h=t(17),d=t(18),y=t(146),f=t(147),E=t(150),v=t(141),b=t(148),k=t(149),w=t(165),x=t(163),j=t(55),D=t.n(j),O=function(e){Object(d.a)(t,e);var a=Object(h.a)(t);function t(){return Object(g.a)(this,t),a.apply(this,arguments)}return Object(p.a)(t,[{key:"render",value:function(){return r.a.createElement(v.a,{align:"center",component:"td",scope:"row"},0===this.props.idx&&r.a.createElement(D.a,{style:{position:"relative",top:5,color:"yellow"}}),1===this.props.idx&&r.a.createElement(D.a,{style:{position:"relative",top:5,color:"silver"}}),2===this.props.idx&&r.a.createElement(D.a,{style:{position:"relative",top:5,color:"brown"}}),this.props.idx>=3&&r.a.createElement(r.a.Fragment,null,this.props.idx+1,"."))}}]),t}(r.a.Component),C=t(155),S=t(151),P=t(153),R=t(154),_=t(160),M=t(152),A=t(76),G=t.n(A),N=t(70),T=t.n(N),B=t(52),W=t.n(B),I=t(109),z=t(164),F=t(74),q=t.n(F),L=t(75),U=t.n(L),Y=t(145),H=t(72),J=t.n(H),K=t(73),V=t.n(K),X=t(71),Z=t.n(X),$="".concat("http://localhost",":").concat(5e3),Q=function(e){Object(d.a)(t,e);var a=Object(h.a)(t);function t(){return Object(g.a)(this,t),a.apply(this,arguments)}return Object(p.a)(t,[{key:"render",value:function(){var e=Z.a.unix(this.props.gameTs);return r.a.createElement(Y.a,{style:{backgroundColor:this.props.background,marginTop:20},component:y.a},r.a.createElement(f.a,{size:"medium","aria-label":"simple table"},r.a.createElement(b.a,null,r.a.createElement(k.a,null,r.a.createElement(v.a,{className:"game-table-header",align:"left"},r.a.createElement("h2",null,e.format("DD/MM/YYYY - HH:mm")))),r.a.createElement(k.a,null,r.a.createElement(v.a,{align:"left"},r.a.createElement("strong",null,"Player")),r.a.createElement(v.a,{align:"center"},r.a.createElement("strong",null,"Rounds played")),r.a.createElement(v.a,{align:"center"},r.a.createElement("strong",null,"Kills")),r.a.createElement(v.a,{align:"center"},r.a.createElement("strong",null,"Damage")),r.a.createElement(v.a,{align:"center"},r.a.createElement("strong",null,"Self damage")),r.a.createElement(v.a,{align:"center"},r.a.createElement("strong",null,"Score")),r.a.createElement(v.a,{align:"center"},r.a.createElement("strong",null,"\u0394Ranking")))),r.a.createElement(E.a,null,this.props.playerEntries.map((function(e,a){return r.a.createElement(k.a,{key:e.name},r.a.createElement(v.a,{align:"left",component:"td",scope:"entry"},r.a.createElement(x.a,{avatar:r.a.createElement(w.a,{alt:"PlayerAvatar",src:$+e.avatar_path},e.name[0]),label:e.name})),r.a.createElement(v.a,{align:"center",component:"td",scope:"entry"},0!==e.rounds_played?e.rounds_played:"-"),r.a.createElement(v.a,{align:"center",component:"td",scope:"entry"},e.kills),r.a.createElement(v.a,{align:"center",component:"td",scope:"entry"},e.damage),r.a.createElement(v.a,{align:"center",component:"td",scope:"entry"},e.self_damage),r.a.createElement(v.a,{align:"center",component:"td",scope:"entry"},e.score),r.a.createElement(v.a,{align:"center",component:"td",scope:"entry"},0!==parseFloat(e.ranking_delta)&&(e.ranking_delta>0?r.a.createElement(J.a,{style:{marginRight:3,position:"relative",top:6,color:"green"}}):r.a.createElement(V.a,{style:{marginRight:3,position:"relative",top:6,color:"red"}})),Math.abs(e.ranking_delta)<10&&"0",Math.abs(e.ranking_delta).toFixed(0)))})))))}}]),t}(r.a.Component),ee=function(e){Object(d.a)(t,e);var a=Object(h.a)(t);function t(){var e;Object(g.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(e=a.call.apply(a,[this].concat(r))).state={gameData:null},e.gameRequestPath="/worms/api/game",e}return Object(p.a)(t,[{key:"fetchGameData",value:function(){var e=Object(u.a)(o.a.mark((function e(){var a,t,n;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(null===this.props.gameId){e.next=10;break}return(a=new URL($+this.gameRequestPath)).searchParams.append("game_id",this.props.gameId),e.next=5,fetch(a);case 5:return t=e.sent,e.next=8,t.json();case 8:n=e.sent,this.setState((function(e,a){return Object(m.a)({},e,{gameData:n})}));case 10:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"componentDidUpdate",value:function(){null!==this.state.gameData&&this.props.gameId===this.state.gameData.game_id||this.fetchGameData()}},{key:"render",value:function(){var e=this;return r.a.createElement(_.a,{PaperProps:{style:{backgroundColor:"#f5f5f5"}},maxWidth:"md",fullWidth:!0,open:null!==this.props.gameId,onEntering:this.fetchGameData.bind(this),onClose:this.props.closeModalCallback,"aria-labelledby":"alert-dialog-title","aria-describedby":"alert-dialog-description"},r.a.createElement(S.a,{id:"alert-dialog-title"},"Game ",null!==this.state.gameData?this.state.gameData.game_id:"..."),r.a.createElement(M.a,null),r.a.createElement(P.a,{style:{marginBottom:20}},null!==this.state.gameData&&r.a.createElement(Q,{gameTs:this.state.gameData.game_ts,playerEntries:this.state.gameData.players_data}),null===this.state.gameData&&r.a.createElement("div",{style:{textAlign:"center",marginTop:20}},r.a.createElement(W.a,{className:"icon-spinner",fontSize:"large"}))),r.a.createElement(M.a,null),r.a.createElement(R.a,null,r.a.createElement(C.a,{onClick:function(){e.setState({gameData:null},(function(){return e.props.changeSelectedGameCallback(!1)}))},color:"primary",autoFocus:!0},r.a.createElement(q.a,null)," Previous"),r.a.createElement(C.a,{onClick:function(){e.setState({gameData:null},(function(){return e.props.changeSelectedGameCallback(!0)}))},color:"primary",autoFocus:!0},"Next ",r.a.createElement(U.a,null)),r.a.createElement(C.a,{onClick:this.props.closeModalCallback,color:"primary",autoFocus:!0},"Close")))}}]),t}(r.a.Component),ae=function(e){Object(d.a)(t,e);var a=Object(h.a)(t);function t(){var e;Object(g.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(e=a.call.apply(a,[this].concat(r))).state={selectedGame:null,processedRankingData:null,gamesRange:[0,0]},e.renderedChart=null,e}return Object(p.a)(t,[{key:"closeModal",value:function(){this.setState((function(e,a){return Object(m.a)({},e,{selectedGame:null})}))}},{key:"changeSelectedGame",value:function(e){var a=this.state.selectedGame.index,t=e?a+1:a-1;(t=Math.max(Math.min(t,this.state.processedRankingData.length-1),1))!==a&&this.setState((function(e,a){return Object(m.a)({},e,{selectedGame:{index:t,id:e.processedRankingData[t].gameId}})}))}},{key:"processRankingData",value:function(){var e=this.props.rankingData,a=e.current_ranking,t=new Array(e.history.length+1);t[e.history.length]={gameId:e.history[e.history.length-1].game_id,x:new Date(1e3*e.history[e.history.length-1].game_ts),y:a};for(var n=e.history.length-1;n>=0;--n){var r=null,l=Date.parse("01 Jun 2020 00:00:00 GMT-03:00");if(n>0){r=e.history[n-1].game_id;var s=e.history[n-1].game_ts;l=new Date(1e3*s)}a-=e.history[n].delta_ranking,t[n]={gameId:r,x:l,y:a}}this.setState((function(e,a){return Object(m.a)({},e,{processedRankingData:t})}))}},{key:"componentDidUpdate",value:function(){var e=this;if(null!==this.props.rankingData){if(null===this.state.processedRankingData)return this.processRankingData(),void this.setState((function(e,a){return Object(m.a)({},e,{gamesRange:[0,a.rankingData.history.length]})}));var a=this.state.processedRankingData.slice(this.state.gamesRange[0],this.state.gamesRange[1]+1),t=a.length>0?a[0].y:1500,n=a.length>0?a[0].y:1500;a.forEach((function(e){t=Math.min(t,e.y),n=Math.max(n,e.y)}));var r=document.getElementById("ranking-history-chart");r.style.backgroundColor="rgba(30,30,30,1)";null!==this.renderedChart&&this.renderedChart.destroy(),this.renderedChart=new T.a(r,{type:"line",data:{datasets:[{fill:!1,label:"Ranking",data:a,backgroundColor:"rgba(220,220,220,1)",borderColor:"rgba(236,245,66,1)",pointBorderColor:a.map((function(e){return e.y===n?"rgba(0,0,255,1)":e.y===t?"rgba(255,0,0,1)":"rgba(236,245,66,1)"})),borderWidth:.8}]},options:{responsive:!0,animation:{duration:null===this.renderedChart?500:0},scales:{xAxes:[{type:"time",distribution:"series",time:{unit:"year",displayFormats:{year:"D/M/YY"}}}],yAxes:[{ticks:{beginAtZero:!1}}]},onClick:function(a,t){if(t.length>0){var n=t[0]._index+e.state.gamesRange[0];n>0&&e.setState((function(e,a){return{selectedGame:{index:n,id:e.processedRankingData[n].gameId}}}))}}}})}}},{key:"render",value:function(){var e=this;return null!==this.props.rankingData?r.a.createElement("div",null,r.a.createElement("canvas",{id:"ranking-history-chart"}),r.a.createElement(ee,{gameId:this.state.selectedGame?this.state.selectedGame.id:null,changeSelectedGameCallback:this.changeSelectedGame.bind(this),closeModalCallback:this.closeModal.bind(this)}),r.a.createElement("div",{style:{marginTop:10,textAlign:"center"}},r.a.createElement(I.a,{id:"range-slider",gutterBottom:!0},"Games date range"),r.a.createElement(z.a,{value:this.state.gamesRange,max:this.props.rankingData.history.length,onChange:function(a,t){e.setState((function(e,a){return Object(m.a)({},e,{gamesRange:t})}))},valueLabelDisplay:"auto","aria-labelledby":"range-slider",getAriaValueText:function(){return"kappa"}}))):r.a.createElement("div",{style:{textAlign:"center"}},r.a.createElement(W.a,{className:"icon-spinner",fontSize:"large"}))}}]),t}(r.a.Component),te=function(e){Object(d.a)(t,e);var a=Object(h.a)(t);function t(){var e;Object(g.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(e=a.call.apply(a,[this].concat(r))).state={rankingData:null},e.rankingHistoryRequestPath="/worms/api/player/ranking_history",e.handleClose=function(){e.props.onModalClose(null),e.setState({rankingData:null})},e}return Object(p.a)(t,[{key:"fetchRankingData",value:function(){var e=Object(u.a)(o.a.mark((function e(){var a,t,n;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return(a=new URL($+this.rankingHistoryRequestPath)).searchParams.append("player_name",this.props.playerName),e.next=4,fetch(a);case 4:return t=e.sent,e.next=7,t.json();case 7:n=e.sent,this.setState((function(e,a){return Object(m.a)({},e,{rankingData:n})}));case 9:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){return r.a.createElement(_.a,{maxWidth:"md",fullWidth:!0,open:null!==this.props.playerName,onEntering:this.fetchRankingData.bind(this),onClose:this.handleClose,"aria-labelledby":"alert-dialog-title","aria-describedby":"alert-dialog-description"},r.a.createElement(S.a,{id:"alert-dialog-title"},this.props.playerName,"'s ranking history"),r.a.createElement(M.a,null),r.a.createElement(P.a,null,r.a.createElement("p",{style:{marginBottom:8,marginTop:0}},r.a.createElement(G.a,{style:{position:"relative",top:4},color:"primary",fontSize:"small"})," Click on a point to see game details"),r.a.createElement(ae,{rankingData:this.state.rankingData})),r.a.createElement(M.a,null),r.a.createElement(R.a,null,r.a.createElement(C.a,{onClick:this.handleClose,color:"primary",autoFocus:!0},"Close")))}}]),t}(r.a.Component),ne=function(e){Object(d.a)(t,e);var a=Object(h.a)(t);function t(){var e;Object(g.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(e=a.call.apply(a,[this].concat(r))).requestPath="/worms/api/ranking",e.state={rows:[],selectedPlayerName:null},e}return Object(p.a)(t,[{key:"componentDidMount",value:function(){this.fetchData()}},{key:"fetchData",value:function(){var e=Object(u.a)(o.a.mark((function e(){var a,t,n;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return a=new URL($+this.requestPath),e.next=3,fetch(a);case 3:return t=e.sent,e.next=6,t.json();case 6:n=e.sent,this.setState((function(e,a){return Object(m.a)({},e,{rows:n})}));case 8:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"changeSelectedPlayer",value:function(e){this.setState((function(a,t){return Object(m.a)({},a,{selectedPlayerName:e})}))}},{key:"render",value:function(){var e=this;return r.a.createElement(y.a,{style:{marginTop:30,overflowX:"auto"},elevation:4},r.a.createElement(f.a,{size:"medium","aria-label":"simple table"},r.a.createElement(b.a,null,r.a.createElement(k.a,null,r.a.createElement(v.a,{align:"center"},r.a.createElement("strong",null,"#")),r.a.createElement(v.a,{align:"center"},r.a.createElement("strong",null,"Player")),r.a.createElement(v.a,{align:"center"},r.a.createElement("strong",null,"Ranking")),r.a.createElement(v.a,{align:"center"},r.a.createElement("strong",null,"Average score")),r.a.createElement(v.a,{align:"center"},r.a.createElement("strong",null,"Games")))),r.a.createElement(E.a,null,this.state.rows.map((function(a,t){return r.a.createElement(k.a,{key:a.name,className:"playerTableRow",onClick:function(){return e.changeSelectedPlayer(a.name)}},r.a.createElement(O,{name:a.name,idx:t}),r.a.createElement(v.a,{align:"center",component:"td",scope:"row"},r.a.createElement(x.a,{avatar:r.a.createElement(w.a,{alt:"PlayerAvatar",src:$+a.avatar_path},a.name[0]),label:a.name})),r.a.createElement(v.a,{style:{color:a.ranking>=1500?"green":"red"},align:"center",component:"td",scope:"row"},a.ranking.toFixed(0)),r.a.createElement(v.a,{align:"center",component:"td",scope:"row"},a.score_avg.toFixed(0)),r.a.createElement(v.a,{align:"center",component:"td",scope:"row"},a.games))})))),r.a.createElement(te,{onModalClose:this.changeSelectedPlayer.bind(this),playerName:this.state.selectedPlayerName}))}}]),t}(r.a.Component),re=t(161),le=t(78),se=t.n(le),ie=t(80),ce=t.n(ie),oe=t(79),me=t.n(oe),ue=t(77),ge=t.n(ue),pe=t(156),he=t(162),de=t(158),ye=function(e){Object(d.a)(t,e);var a=Object(h.a)(t);function t(){var e;Object(g.a)(this,t);for(var n=arguments.length,r=new Array(n),l=0;l<n;l++)r[l]=arguments[l];return(e=a.call.apply(a,[this].concat(r))).requestPath="/worms/api/games",e.state={games:[],currentPage:0,numPages:0,pageSize:5,resultsBackground:"#f5f5f5"},e}return Object(p.a)(t,[{key:"componentDidMount",value:function(){this.fetchData()}},{key:"fetchData",value:function(){var e=Object(u.a)(o.a.mark((function e(){var a,t,n;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return this.setState((function(e,a){return Object(m.a)({},e,{resultsBackground:"#f5f5f5"})})),(a=new URL($+this.requestPath)).searchParams.append("page",this.state.currentPage),a.searchParams.append("page_size",this.state.pageSize),e.next=6,fetch(a);case 6:return t=e.sent,e.next=9,t.json();case 9:n=e.sent,this.setState((function(e,a){return Object(m.a)({},e,{games:n.games,numPages:n.num_pages,resultsBackground:"white"})}));case 11:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this;return r.a.createElement(y.a,{style:{marginTop:30,paddingBottom:20,backgroundColor:"#f5f5f5"},elevation:3},r.a.createElement("h1",{style:{paddingTop:15,display:"block"}},"Games"),r.a.createElement("div",{style:{marginBottom:12}},r.a.createElement(he.a,{id:"demo-simple-select-label"},"Games per page"),r.a.createElement(de.a,{style:{width:45},labelId:"demo-simple-select-label",id:"demo-simple-select",value:this.state.pageSize,onChange:function(a){a.persist(),e.setState(Object(m.a)({},e.state,{pageSize:parseInt(a.target.value),currentPage:0}),e.fetchData)}},r.a.createElement(re.a,{value:5},"5"),r.a.createElement(re.a,{value:10},"10"),r.a.createElement(re.a,{value:20},"20"))),r.a.createElement("div",null,r.a.createElement(pe.a,{style:{padding:"0 0 0 0"},onClick:function(){0!==e.state.currentPage&&e.setState((function(e,a){return Object(m.a)({},e,{currentPage:0})}),e.fetchData)},"aria-label":"first page"},r.a.createElement(ge.a,null)),r.a.createElement(pe.a,{style:{padding:"0 0 0 0"},onClick:function(){var a=Math.max(0,e.state.currentPage-1);a!==e.state.currentPage&&e.setState((function(e,t){return Object(m.a)({},e,{currentPage:a})}),e.fetchData)},"aria-label":"previous page"},r.a.createElement(se.a,null)),r.a.createElement("span",{style:{color:"rgba(0,0,0,0.54)",fontWeight:400,fontSize:16}},"".concat(this.state.currentPage+1,"/").concat(this.state.numPages)),r.a.createElement(pe.a,{style:{padding:"0 0 0 0"},onClick:function(){var a=Math.min(e.state.currentPage+1,e.state.numPages-1);a!==e.state.currentPage&&e.setState((function(e,t){return Object(m.a)({},e,{currentPage:a})}),e.fetchData)},"aria-label":"next page"},r.a.createElement(me.a,null)),r.a.createElement(pe.a,{style:{padding:"0 0 0 0"},onClick:function(){e.state.currentPage!==e.state.numPages-1&&e.setState((function(e,a){return Object(m.a)({},e,{currentPage:e.numPages-1})}),e.fetchData)},"aria-label":"last page"},r.a.createElement(ce.a,null))),r.a.createElement("div",null,Object.keys(this.state.games).map((function(a){return r.a.createElement("div",{style:{width:"95%",margin:"auto"},key:a+"div"},r.a.createElement(Q,{key:a,background:e.state.resultsBackground,gameTs:a,playerEntries:e.state.games[a]}))}))))}}]),t}(r.a.Component),fe=t(81),Ee=t.n(fe),ve=function(e){Object(d.a)(t,e);var a=Object(h.a)(t);function t(){var e;Object(g.a)(this,t);for(var n=arguments.length,l=new Array(n),s=0;s<n;s++)l[s]=arguments[s];return(e=a.call.apply(a,[this].concat(l))).state={helpModalOpen:!1},e.dialogContentRef=r.a.createRef(),e}return Object(p.a)(t,[{key:"changeModal",value:function(e){this.setState({helpModalOpen:e})}},{key:"typeSetEquations",value:function(){window.MathJax.typeset([this.dialogContentRef.current])}},{key:"render",value:function(){var e=this;return r.a.createElement(r.a.Fragment,null,r.a.createElement("div",{className:"help-icon-div"},r.a.createElement(Ee.a,{color:"inherit",fontSize:"inherit",onClick:function(){return e.changeModal(!0)}})),r.a.createElement(_.a,{maxWidth:"md",fullWidth:!0,open:this.state.helpModalOpen,onClose:function(){return e.changeModal(!1)},onEntered:this.typeSetEquations.bind(this)},r.a.createElement(S.a,null,r.a.createElement("strong",null,"Worms Ranking System")),r.a.createElement(P.a,{ref:this.dialogContentRef},r.a.createElement("h4",null,"This is a ranking system built for Worms Armageddon v3.7.2.1."),r.a.createElement("p",null,"The data here displayed is collected by a program that reads through the game process' memory and is then sent to the server."),r.a.createElement("p",null,"The server, in turn, computes each player score and ranking change and saves everything into a database."),r.a.createElement("p",{className:"help-section-paragraph"}," ",r.a.createElement("strong",null," Score measures how well a player did in a given game and is calculated as: ")," "),"\\[ score = { 3 * \\text{ } kills + { damage \\over 10 } - { self damage \\over 10 } } \\]",r.a.createElement("p",{className:"help-section-paragraph"}," ",r.a.createElement("strong",null," \u0394ranking is the amount of change in a player's ranking after a given game and is calculated as: ")," "),"\\[ \u0394ranking = { (score_{player} - score_{game}) * \\text{ } rounds_{weight} * \\text{ } \\Big({Ranking_{player} \\over Ranking_{game}}\\Big)^2} \\]",r.a.createElement("div",{style:{textAlign:"center",marginTop:10,marginBottom:10}},r.a.createElement("p",{className:"help-section-paragraph"},r.a.createElement("strong",null,"where:"))),"\\[ score_{game} = \\text{average score of all players in a given game} \\]","\\[ ranking_{game} = \\text{average ranking of all players in a given game} \\]","\\[ rounds_{weight} = { b ^ {(rounds_{player} - rounds_{game})} } \\]",r.a.createElement("div",{style:{textAlign:"center",marginTop:10,marginBottom:10}},r.a.createElement("p",{className:"help-section-paragraph"},r.a.createElement("strong",null,"where:"))),"\\[ rounds_{player} = \\text{rounds played by the player in a given game} \\]","\\[ rounds_{game} = \\text{average rounds played by all player in a given game} \\]","\\[ b = { \\text{0.9 if } rounds_{player} > rounds_{game} \\text{ or 0.75 otherwise} } \\]"),r.a.createElement(M.a,null),r.a.createElement(R.a,null,r.a.createElement(C.a,{onClick:function(){return e.changeModal(!1)},color:"primary",autoFocus:!0},"Close"))))}}]),t}(r.a.Component);var be=function(){return r.a.createElement("div",{className:"App"},r.a.createElement(i.a,{maxWidth:"md"},r.a.createElement("h1",{style:{display:"inline-block"}},"Worms Ranking System"),r.a.createElement("img",{style:{height:100,position:"relative",top:20,marginLeft:5},src:"./worms.png"}),r.a.createElement(ne,null),r.a.createElement(ye,null),r.a.createElement(ve,null)))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));s.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(be,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))},94:function(e,a,t){e.exports=t(108)},99:function(e,a,t){}},[[94,1,2]]]);
//# sourceMappingURL=main.57cf8f27.chunk.js.map