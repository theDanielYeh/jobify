import React from 'react';
import LoginPage from '../components/login';
import SignUp from '../components/signup';

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: true
    };
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  handleTabChange(event) {
    this.setState({ tab: !this.state.tab });
    event.preventDefault();
  }

  render() {
    const tabView = this.state.tab ? <LoginPage /> : <SignUp />;
    const message = this.state.tab ? "Don't have an account?" : 'Already have an account?';
    const linkView = this.state.tab ? 'Sign up' : 'Log in';

    return (
      <div className="">
        {tabView}
        <p className='loginform-p'>
          {message}
          <a className='loginform-a' href="" onClick={this.handleTabChange}>{linkView}</a>
        </p>
      </div>

    );
  }
}
