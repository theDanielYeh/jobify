import React from 'react';
import Button from 'react-bootstrap/Button';
import AppContext from '../lib/app-context';

export default class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      loginError: false,
      load: false
    };
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleEmailChange(event) {
    this.setState({ email: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({
      password: event.target.value,
      loginError: false
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state)
    };

    if (this.state.password.length > 0) {
      this.setState({ load: true });
      fetch('/api/auth/sign-in', req)
        .then(res => res.json())
        .then(result => {
          this.setState({ load: false });
          if (result.user && result.token) {
            const { handleSignIn } = this.context;
            handleSignIn(result);
            this.setState({ loginError: false });
          } else {
            this.setState({ loginError: true });
          }
        });
    }
  }

  render() {
    const loaderStatus = this.state.load ? 'loader' : 'hidden';
    const errorMsg = this.state.loginError === true ? 'Invalid login credentials. Please try again.' : null;
    return (
      <div className="parent-container">
        <span id="loader" className={loaderStatus}></span>
        <form action="" className="login-form" id="login-form" onSubmit={this.handleSubmit}>
          <h1>Jobify</h1>
          <h2><i>Log in to your account</i></h2>
          <p className='welcome-p'>Welcome back! Please enter your details.</p>
          <label htmlFor="email">
            Email
            <input
              required
              type="email"
              name="email"
              id="email"
              onChange={this.handleEmailChange}
              value={this.state.email}
              placeholder="Enter your email"/>
          </label>
          <label htmlFor="password">
            Password
            <input
              required
              type="password"
              name="password"
              id='password'
              onChange={this.handlePasswordChange}
              value={this.state.password}
              placeholder="Password" />
          </label>
          <Button className="signin-button" variant="primary" type="submit">
            Sign in
          </Button>
          <p className="red-warning-two">{errorMsg}</p>
        </form>
      </div>
    );
  }
}

LoginPage.contextType = AppContext;
