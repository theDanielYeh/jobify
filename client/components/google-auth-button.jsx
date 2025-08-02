import React from 'react';

export default class GoogleAuthButton extends React.Component {
  constructor(props) {
    super(props);
    this.buttonRef = React.createRef();
    this.renderButton = this.renderButton.bind(this);
  }

  componentDidMount() {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      this.renderButton();
    } else {
      window.addEventListener('google-loaded', this.renderButton);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('google-loaded', this.renderButton);
  }

  renderButton() {
    window.google.accounts.id.initialize({
      client_id: process.env.GOOGLE_CLIENT_ID,
      callback: this.props.onCredential,
      ux_mode: 'popup'
    });
    window.google.accounts.id.renderButton(
      this.buttonRef.current,
      { theme: 'outline', size: 'large', text: this.props.text }
    );
  }

  render() {
    return <div ref={this.buttonRef}></div>;
  }
}
