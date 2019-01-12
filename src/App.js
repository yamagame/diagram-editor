import React, { Component } from 'react';
import Loadable from 'react-loadable';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const loading = () => <div>Loading...</div>;

const Diagram = Loadable({
  loader: () => import('./containers/Diagram'),
  loading,
});

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route exact path={`${process.env.PUBLIC_URL}/`} component={Diagram} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
