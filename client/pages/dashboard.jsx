import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import AppContext from '../lib/app-context';
import NewCard from '../components/newcard';
import EditCard from '../components/editcard';
import ConfirmDelete from '../components/deletemodal';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newCard: false,
      editCard: false,
      savedJobData: '',
      deleter: false,
      deleteId: ''
    };
    this.handleNewCard = this.handleNewCard.bind(this);
    this.handleEditCard = this.handleEditCard.bind(this);
    this.toggleEditCard = this.toggleEditCard.bind(this);
    this.toggleDelete = this.toggleDelete.bind(this);
  }

  componentDidMount() {
    const { handleCardEvents } = this.context;
    handleCardEvents();
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

  toggleDelete(jobId) {
    this.setState({
      deleter: !this.state.deleter,
      deleteId: jobId
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
        this.toggleEditCard();
      });
  }

  render() {
    const { user, handleSignOut } = this.context;
    const popCard = this.state.newCard
      ? <NewCard handleMe={this.handleNewCard}/>
      : this.state.editCard
        ? <EditCard handleMe={this.toggleEditCard} dataToLoadJob={this.state.savedJobData}/>
        : this.state.deleter
          ? <ConfirmDelete handleMe={this.toggleDelete} dataToDelete={this.state.deleteId} />
          : null;
    const dataArrayExist = user.dataArray
      ? user.dataArray.map(item => {
        const statusColor = item.status === 'Active'
          ? 'orange-color'
          : item.status === 'Offered'
            ? 'green-color'
            : 'gray-color';
        return (
                <div key={item.jobId} className="card-wrapper">
                  <div className="job-card">
                    <div className="top-half-card">
                      <div className="top-half-top-card">
                       <h3>{item.company}</h3>
                      </div>
                      <div className="top-half-bottom-card">
                        <h3><em>{item.position}</em></h3>
                      </div>
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
                    <i className="fa-solid fa-ban fa-lg" onClick={() => this.toggleDelete(item.jobId)}></i>
                  </div>
                </div>
        );
      })
      : null;
    return (
      <>
      {popCard}
      <Navbar bg="" variant="dark" className='navbar' fixed="top">
        <Container className="dashboard-container">
          <Navbar.Brand href="#" className='nav-brand'><em>Jobify</em></Navbar.Brand>
          <Navbar.Brand href="#" className='nav-welcome'>Welcome back, {user.firstName}!</Navbar.Brand>
          <Navbar.Collapse id="nav-bar-scroll">
            <Nav className="me-auto">
              <Nav.Link href="#" onClick={this.handleNewCard}>
                <i className="fa-solid fa-square-plus fa-2xl"></i>
              </Nav.Link>
              <Nav.Link href="#" onClick={handleSignOut}>Sign out</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div className="card-deck">
        {dataArrayExist}
      </div>
      </>
    );
  }
}

Dashboard.contextType = AppContext;
