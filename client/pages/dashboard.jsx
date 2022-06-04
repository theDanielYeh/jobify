import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import AppContext from '../lib/app-context';

export default class Dashboard extends React.Component {
  render() {
    const { handleSignOut } = this.context;
    return (
      <Navbar bg="primary" variant="dark">
        <Container className="dashboard-container">
          <Navbar.Brand href="#home">Welcome [user]!</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#dashboard">Dashboard</Nav.Link>
            <Nav.Link href="">
              <i className="fa-solid fa-square-plus fa-2xl"></i>
            </Nav.Link>
            <Nav.Link href="#about">About</Nav.Link>
            <Nav.Link href="#about" onClick={handleSignOut}>Sign out</Nav.Link>
          </Nav>

        </Container>
      </Navbar>
    );
  }
}

Dashboard.contextType = AppContext;
