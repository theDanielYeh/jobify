import React from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import AppContext from '../lib/app-context';

export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      emailInUse: false,
      load: false
    };
    this.handleFirstName = this.handleFirstName.bind(this);
    this.handleLastName = this.handleLastName.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleGoogleClick = this.handleGoogleClick.bind(this);
  }

  handleFirstName(event) {
    this.setState({ firstName: event.target.value });
  }

  handleLastName(event) {
    this.setState({ lastName: event.target.value });
  }

  handleEmailChange(event) {
    this.setState({
      email: event.target.value.toLowerCase(),
      emailInUse: false
    });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  handleConfirmPasswordChange(event) {
    this.setState({ confirmPassword: event.target.value });
  }

  handleGoogleClick() {
    this.setState({ load: true });
    const googleWindow = window.open('/api/auth/google', 'google', 'width=500,height=600');
    const timer = setInterval(() => {
      if (!googleWindow || googleWindow.closed) {
        clearInterval(timer);
        this.setState({ load: false });
        return;
      }
      try {
        const { body } = googleWindow.document;
        const text = body && body.innerText;
        if (text) {
          const data = JSON.parse(text);
          if (data.token && data.user) {
            const { handleSignIn } = this.context;
            handleSignIn(data);
            this.setState({ emailInUse: false, load: false });
            googleWindow.close();
            clearInterval(timer);
          }
        }
      } catch (err) {
        // ignore cross-origin errors until redirect returns to our domain
      }
    }, 500);
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
    if (this.state.password.length > 7 && this.state.confirmPassword === this.state.password) {
      this.setState({ load: true });
      fetch('/api/auth/sign-up', req)
        .then(res => res.json())
        .then(result => {
          this.setState({ load: false });
          if (!result) {
            this.setState({ emailInUse: true });
          } else if (result.user && result.token) {
            const { handleSignIn } = this.context;
            handleSignIn(result);
            this.setState({ emailInUse: false });
          }
        });
    }
  }

  render() {
    const loaderStatus = this.state.load ? 'loader' : 'hidden';
    const errorMsg = this.state.password.length === 0
      ? ''
      : this.state.password.length < 8
        ? 'Your password is too short. Minimum 8 characters.'
        : '';
    const errorMsgTwo = this.state.confirmPassword.length === 0
      ? ''
      : this.state.confirmPassword !== this.state.password
        ? 'Passwords do not match.'
        : '';
    const errorMsgThree = this.state.emailInUse === true ? 'Email is already in use.' : null;
    return (
      <div className="parent-container">
        <span id="loader" className={loaderStatus}></span>
        <Form onSubmit={this.handleSubmit} className='login-form'>
          <h1>Jobify</h1>
          <h2><i>Create an account</i></h2>
          <p className='welcome-p'>Welcome guest! Please enter your details.</p>
          <Form.Group className='mb-3' controlId='formBasicFirstName'>
            <Form.Label>First Name</Form.Label>
            <Form.Control
              required
              type='name'
              name='firstName'
              onChange={this.handleFirstName}
              value={this.state.firstName}
              placeholder='Enter your first name'
            />
          </Form.Group>
          <Form.Group className='mb-3' controlId='formBasicLastName'>
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              required
              type='name'
              name='lastName'
              onChange={this.handleLastName}
              value={this.state.lastName}
              placeholder='Enter your last name'
            />
          </Form.Group>
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
          <p className="red-warning">{errorMsgThree}</p>
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
          <p className="red-warning">{errorMsg}</p>
          <Form.Group className='mb-3' controlId='formBasicConfirmPassword'>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              required
              type='password'
              name='confirmPassword'
              onChange={this.handleConfirmPasswordChange}
              value={this.state.confirmPassword}
              placeholder='Confirm Password'
            />
          </Form.Group>
          <p className="red-warning">{errorMsgTwo}</p>
          <Button className="signin-button" variant="primary" type="submit">
            Get started
          </Button>
          <Button className='google-b' onClick={this.handleGoogleClick}>Sign up with Google</Button>
        </Form>
      </div>
    );
  }
}

SignUp.contextType = AppContext;
