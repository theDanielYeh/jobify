import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import AppContext from '../lib/app-context';
import NewCard from '../components/newcard';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newCard: false
    };
    this.handleNewCard = this.handleNewCard.bind(this);
  }

  handleNewCard() {
    this.setState({
      newCard: !this.state.newCard
    });
  }

  render() {
    const { user, handleSignOut } = this.context;
    console.log(user.dataArray);
    const newCard = this.state.newCard ? <NewCard handleMe={this.handleNewCard}/> : null;
    return (
      <>
      {newCard}
      <Navbar bg="primary" variant="dark">
        <Container className="dashboard-container">
          <Navbar.Brand href="#home">Welcome back, {user.firstName}!</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#dashboard">Dashboard</Nav.Link>
            <Nav.Link href="" onClick={this.handleNewCard}>
              <i className="fa-solid fa-square-plus fa-2xl"></i>
            </Nav.Link>
            <Nav.Link href="#about">About</Nav.Link>
            <Nav.Link href="#about" onClick={handleSignOut}>Sign out</Nav.Link>
          </Nav>

        </Container>
      </Navbar>
      {user.dataArray.map(item => {
        return (
          <p key={item.jobId}>{item.company}</p>
        );
      })}
      </>
    );
  }
}

Dashboard.contextType = AppContext;
