import React from 'react';
import Button from 'react-bootstrap/Button';

export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleNameChange(event) {
    this.setState({ name: event.target.value });
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
    // need code here to hook up to database
    event.preventDefault();
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
        <form action="" className="login-form" id="login-form" onSubmit={this.handleSubmit}>
          <h1>Jobify</h1>
          <h2><i>Create an account</i></h2>
          <p className='welcome-p'>Welcome guest! Please enter your details.</p>
          <label htmlFor="name">
            Name
            <input required type="name" name="name" id="name" onChange={this.handleNameChange} value={this.state.name} placeholder="Enter your name" />
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
