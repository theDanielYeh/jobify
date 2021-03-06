import React from 'react';
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import decodeToken from './lib/decode-token';
import AppContext from './lib/app-context';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isAuthorizing: true,
      load: false
    };
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleCardEvents = this.handleCardEvents.bind(this);
  }

  componentDidMount() {
    const token = window.localStorage.getItem('react-context-jwt');
    const user = token ? decodeToken(token) : null;
    this.setState({ user, isAuthorizing: false });
  }

  handleSignIn(result) {
    const { user, token } = result;
    window.localStorage.setItem('react-context-jwt', token);
    this.setState({ user });
    this.setState({ load: true });
  }

  handleCardEvents() {
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': localStorage.getItem('react-context-jwt')
      },
      body: JSON.stringify(this.state)
    };
    fetch('/api/auth/handleCardEvents', req)
      .then(res => res.json())
      .then(result => {
        const { user } = result;
        this.setState({ user });
        this.setState({ load: false });
      }
      );
  }

  handleSignOut() {
    window.localStorage.removeItem('react-context-jwt');
    this.setState({ user: null });
  }

  render() {
    const loaderStatus = this.state.load ? 'loader' : 'hidden';
    const { user } = this.state;
    const { handleSignIn, handleSignOut, handleCardEvents } = this;
    const contextValue = { user, handleSignIn, handleSignOut, handleCardEvents };
    const pageToRender = !user ? <Home /> : <Dashboard />;
    return (
      <AppContext.Provider value={contextValue}>
        <span id="loader" className={loaderStatus}></span>
        {pageToRender}
      </AppContext.Provider>

    );
  }
}
