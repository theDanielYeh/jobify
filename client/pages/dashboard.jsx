import React from 'react';
import { Navbar, Container, Nav, Card, Button } from 'react-bootstrap';
import AppContext from '../lib/app-context';
import NewCard from '../components/newcard';
import EditCard from '../components/editcard';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newCard: false,
      editCard: false,
      savedJobData: ''
    };
    this.handleNewCard = this.handleNewCard.bind(this);
    this.handleEditCard = this.handleEditCard.bind(this);
    this.toggleEditCard = this.toggleEditCard.bind(this);
  }

  handleNewCard() {
    this.setState({
      newCard: !this.state.newCard
    });
  }

  toggleEditCard() {
    this.setState({
      editCard: !this.state.editCard
    });
  }

  handleEditCard(jobId) {
    const req = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': localStorage.getItem('react-context-jwt')
      }
    };
    fetch(`/api/auth/saved-card/${jobId}`, req)
      .then(res => res.json())
      .then(result => {
        this.setState({
          savedJobData: result.payload
        });
        console.log('handleEditCard fetch returned.');
        this.toggleEditCard();
        // if (action === 'sign-up') {
        //   window.location.hash = 'sign-in';
        // } else if (result.user && result.token) {
        //   this.props.onSignIn(result);
        // }
        // if (result.user && result.token) {
        //   const { handleSignIn } = this.context;
        //   handleSignIn(result);
      }
      );
  }

  render() {
    const { user, handleSignOut } = this.context;
    console.log(user.dataArray);
    const popCard = this.state.newCard
      ? <NewCard handleMe={this.handleNewCard}/>
      : this.state.editCard
        ? <EditCard handleMe={this.toggleEditCard} dataToLoadJob={this.state.savedJobData}/>
        : null;
    return (
      <>
      {popCard}
      <Navbar bg="primary" variant="dark" className='navbar'>
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
      <div className="card-deck">
        {user.dataArray.map(item => {
          const statusColor = item.status === 'Active'
            ? 'orange-color'
            : item.status === 'Offered'
              ? 'green-color'
              : 'gray-color';
          return (
            <div key={item.jobId} className="card-wrapper">
                <div className="pokemon-card">
                  <div className="top-half-card">
                    <h3>{item.company}</h3>
                    <h3><em>{item.position}</em></h3>
                    <div className="" onClick={() => this.handleEditCard(item.jobId)}>
                      <i className="fa-solid fa-ellipsis-vertical" ></i>
                    </div>
                  </div>
                  <div className="middle-half-card">
                    <h6>{item.notes}</h6>
                  </div>
                  <div className="bottom-half-card">
                    <p className={statusColor}>{item.status}</p>
                    <p>Applied: {item.dateApplied.substring(0, 10)}</p>
                  </div>
                </div>
              </div>
          );
        })}
      </div>
      </>
    );
  }
}

Dashboard.contextType = AppContext;
