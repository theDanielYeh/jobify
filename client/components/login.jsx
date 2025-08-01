import React from 'react';
import { OverlayTrigger, Tooltip, Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import GoogleAuthButton from './google-auth-button';
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
    this.handleDemoClick = this.handleDemoClick.bind(this);
    this.handleGoogleCredential = this.handleGoogleCredential.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleEmailChange(event) {
    this.setState({ email: event.target.value.toLowerCase() });
  }

  handlePasswordChange(event) {
    this.setState({
      password: event.target.value,
      loginError: false
    });
  }

  handleDemoClick(event) {
    this.setState({
      email: 'demo@gmail.com',
      password: '12345678'
    });
  }

  handleGoogleCredential(response) {
    this.setState({ load: true });
    fetch('/api/auth/google-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    })
      .then(res => res.json())
      .then(data => {
        this.setState({ load: false });
        if (data.token && data.user) {
          const { handleSignIn } = this.context;
          handleSignIn(data);
          this.setState({ loginError: false });
        }
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
    const renderTooltip = props => (
      <Tooltip id="button-tooltip" {...props}>
        Email: demo@gmail.com
        Password: 12345678
      </Tooltip>
    );
    return (
      <div className="parent-container">
        <span id="loader" className={loaderStatus}></span>
        <Form onSubmit={this.handleSubmit} className='login-form' id='login-form'>
          <h1>Jobify</h1>
          <h2><i>Log in to your account</i></h2>
          <p className='welcome-p'>Welcome back! Please enter your details.</p>
          <Form.Group className='mb-3' controlId='formBasicEmail'>
            <Form.Label>Email</Form.Label>
            <Form.Control
              required
              type='email'
              name='email'
              onChange={this.handleEmailChange}
              value={this.state.email}
              placeholder='Enter your email'
              />
          </Form.Group>
          <Form.Group className='mb-3' controlId='formBasicPassword'>
            <Form.Label>Password</Form.Label>
            <Form.Control
              required
              type='password'
              name='password'
              onChange={this.handlePasswordChange}
              value={this.state.password}
              placeholder='Password'
            />
          </Form.Group>
          <Button className="signin-button" variant="primary" type="submit">
            Sign in
          </Button>
          <GoogleAuthButton text='signin_with' onCredential={this.handleGoogleCredential} />
          <p className="red-warning-two">{errorMsg}</p>
          <OverlayTrigger
            placement="top"
            delay={{ show: 150, hide: 300 }}
            overlay={renderTooltip}
          >
            <Button className='demo-b' onClick={this.handleDemoClick}>Demo Login</Button>
          </OverlayTrigger>
        </Form>
      </div>
    );
  }
}

LoginPage.contextType = AppContext;
