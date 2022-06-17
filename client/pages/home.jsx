import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
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
    const renderTooltip = props => (
      <Tooltip id="button-tooltip" {...props}>
        Email: demo@gmail.com
        Password: 12345678
      </Tooltip>
    );

    return (
      <div className="">
        {tabView}
        <p className='loginform-p'>
          {message}
          <a className='loginform-a' href="" onClick={this.handleTabChange}>{linkView}</a>
        </p>
        <OverlayTrigger
          placement="top"
          delay={{ show: 150, hide: 300 }}
          overlay={renderTooltip}
        >
          <p className='demo-p'>Demo Tooltip</p>
        </OverlayTrigger>
      </div>

    );
  }
}
