import React from 'react';
import Button from 'react-bootstrap/Button';

export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    this.handleFirstName = this.handleFirstName.bind(this);
    this.handleLastName = this.handleLastName.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleFirstName(event) {
    this.setState({ firstName: event.target.value });
  }

  handleLastName(event) {
    this.setState({ lastName: event.target.value });
  }

  handleEmailChange(event) {
    this.setState({ email: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  handleConfirmPasswordChange(event) {
    this.setState({ confirmPassword: event.target.value });
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

    if (this.state.password.length < 8 && this.state.confirmPassword === this.state.password) {
      fetch('/api/auth/sign-up', req)
        .then(res => res.json())
        .then(result => {
          console.log('it works');
          // if (action === 'sign-up') {
          //   window.location.hash = 'sign-in';
          // } else if (result.user && result.token) {
          //   this.props.onSignIn(result);
          // }
        });
    }
  }

  render() {
    const errorMsg = this.state.password.length === 0
      ? ''
      : this.state.password.length < 8
        ? 'Your password is too short. Minimum 8 characters.'
        : '';
    const errorMsgTwo = this.state.confirmPassword.length === 0
      ? ''
      : this.state.confirmPassword !== this.state.password
        ? 'Does not match password.'
        : '';
    return (
      <div className="parent-container">
        <form className="login-form" id="login-form" onSubmit={this.handleSubmit}>
          <h1>Jobify</h1>
          <h2><i>Create an account</i></h2>
          <p className='welcome-p'>Welcome guest! Please enter your details.</p>
          <label htmlFor="firstName">
            First Name
              <input
              required
              type="name"
              name="firstName"
              id="firstName"
              onChange={this.handleFirstName}
              value={this.state.firstName}
              placeholder="Enter your first name" />
          </label>
          <label htmlFor="lastName">
            Last Name
            <input required type="name" name="lastName" id="lastName" onChange={this.handleLastName} value={this.state.lastName} placeholder="Enter your last name" />
          </label>
          <label htmlFor="email">
            Email
            <input required type="email" name="email" id="email" onChange={this.handleEmailChange} value={this.state.email} placeholder="Enter your email"/>
          </label>
          <label htmlFor="password">
            Password
            <input required type="password" name="password" id='password' onChange={this.handlePasswordChange} value={this.state.password} placeholder="Password" />
          </label>
          <p className="red-warning">{errorMsg}</p>
          <label htmlFor="confirmPassword">
            Confirm Password
            <input required type="password" name="comfirmPassword" id='confirmPassword' onChange={this.handleConfirmPasswordChange} value={this.state.confirmPassword} placeholder="Password" />
          </label>
          <p className="red-warning">{errorMsgTwo}</p>
          <Button className="signin-button" variant="primary" type="submit">
            Get started
          </Button>
        </form>
      </div>
    );
  }
}
