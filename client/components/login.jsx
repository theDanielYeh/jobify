import React from 'react';
import Button from 'react-bootstrap/Button';

export default class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: ''
    };
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleEmailChange(event) {
    this.setState({ email: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  handleSubmit(event) {
    // need code here to hook up to database
    event.preventDefault();
  }

  render() {
    return (
      <div className="parent-container">
        <form action="" className="login-form" id="login-form" onSubmit={this.handleSubmit}>
          <h1>Jobify</h1>
          <h2><i>Log in to your account</i></h2>
          <p className='welcome-p'>Welcome back! Please enter your details.</p>
          <label htmlFor="email">
            Email
            <input required type="email" name="email" id="email" onChange={this.handleEmailChange} value={this.state.email} placeholder="Enter your email"/>
          </label>
          <label htmlFor="password">
            Password
            <input required type="password" name="password" id='password' onChange={this.handlePasswordChange} value={this.state.password} placeholder="Password" />
          </label>
          <Button className="signin-button" variant="primary" type="submit">
            Sign in
          </Button>
        </form>
      </div>
    );
  }
}
