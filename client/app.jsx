import React from 'react';
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppContext from './lib/app-context';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      csrfToken: '',
      isAuthorizing: true,
      load: false
    };
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleCardEvents = this.handleCardEvents.bind(this);
  }

  componentDidMount() {
    fetch('/api/csrf-token', { credentials: 'include' })
      .then(res => res.json())
      .then(({ csrfToken }) => {
        this.setState({ csrfToken });
        return fetch('/api/auth/handleCardEvents', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({})
        });
      })
      .then(res => {
        if (!res.ok) {
          this.setState({ isAuthorizing: false });
          return null;
        }
        return res.json();
      })
      .then(result => {
        if (result && result.user) {
          this.setState({ user: result.user, isAuthorizing: false });
        } else {
          this.setState({ isAuthorizing: false });
        }
      });
  }

  handleSignIn(result) {
    const { user } = result;
    this.setState({ user, load: true });
  }

  handleCardEvents() {
    const req = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.state.csrfToken
      },
      body: JSON.stringify({})
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
    fetch('/api/auth/sign-out', {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-Token': this.state.csrfToken }
    })
      .then(() => {
        this.setState({ user: null });
      });
  }

  render() {
    const loaderStatus = this.state.load ? 'loader' : 'hidden';
    const { user, csrfToken } = this.state;
    const { handleSignIn, handleSignOut, handleCardEvents } = this;
    const contextValue = { user, csrfToken, handleSignIn, handleSignOut, handleCardEvents };
    const pageToRender = !user ? <Home /> : <Dashboard />;
    return (
      <AppContext.Provider value={contextValue}>
        <span id="loader" className={loaderStatus}></span>
        {pageToRender}
      </AppContext.Provider>

    );
  }
}
