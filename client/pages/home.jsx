import React from 'react';

import LoginPage from '../components/login';
import SignUp from '../components/signup';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: true,
      load: false
    };
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  handleTabChange(event) {
    this.setState({ tab: !this.state.tab });
    event.preventDefault();
  }

  render() {
    const loaderStatus = this.state.load ? 'loader' : 'hidden';
    const tabView = this.state.tab ? <LoginPage demoEmail={this.state.email} demoPassword={this.state.password} /> : <SignUp />;
    const message = this.state.tab ? "Don't have an account?" : 'Already have an account?';
    const linkView = this.state.tab ? 'Sign up' : 'Log in';

    return (
      <div className="">
        <span id="loader" className={loaderStatus}></span>
        {tabView}
        <p className='loginform-p'>
          {message}
          <a className='loginform-a' href="" onClick={this.handleTabChange}>{linkView}</a>
        </p>
      </div>
    );
  }
}
