import React from 'react';
import { BrowserRouter as Router, Route, Link, NavLink, Redirect, Switch } from "react-router-dom";
import { withRouter } from "react-router";
import './App.css';

function App() {
  return (
    <Router basename='/test'>
      <div>
        <ul>
          <li>
            <Link to="/" message='a'>Home</Link>
          </li>
          <li>
            <Link to="/withRouter" message='a'>With Router</Link>
          </li>
          <li>
            <NavLink to="/about" activeStyle={{color:"red"}}>About</NavLink>
          </li>
          <li>
            <Link to="/topics">Topics</Link>
          </li>
          <li>
            <Link to="/redirect">Redirect</Link>
          </li>
        </ul>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/withRouter" component={WithRouter1} />
          <Route path="/about" component={About} />
          <Route path="/topics" component={Topics} />
          <Route path="/redirect" render={() => <Redirect to="/"/>}/>
        </Switch>
      </div> 
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  )
}

function About() {
  return (
    <div>
      <h2>About</h2>
    </div>
  )
}

const WithRouter1 = withRouter(({ match, location, history })=> {
  return (
    <div>Your location is {location.pathname}</div>
  );
})

function Topics({match}) {
  return (
    <div>
      <h2>Topics</h2>
      <ul>
        <li>
          <Link to={`${match.url}/topic1`}>topic1</Link>
        </li>
        <li>
          <Link to={`${match.url}/topic2`}>topic2</Link>
        </li>
        <li>
          <Link to={`${match.url}/topic3`}>topic3</Link>
        </li>
      </ul>
      <Route exact path={match.path} render={() => <h3>Select topic</h3>} />
      <Route path={`${match.url}/:topicId`} component={Topic} />
    </div>
  )
}

function Topic({match}){
  return (
    <div>
      <h3>{match.params.topicId}</h3>
    </div>
  )
}
export default App;
