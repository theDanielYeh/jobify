import React from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import AppContext from '../lib/app-context';

export default class EditCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      savedJobId: '',
      newCompany: '',
      newPosition: '',
      newDate: '',
      newStatus: '',
      newNotes: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const infoLoader = this.props.dataToLoadJob;
    this.setState({
      savedJobId: infoLoader.jobId,
      newCompany: infoLoader.company,
      newPosition: infoLoader.position,
      newDate: infoLoader.dateApplied.substring(0, 10),
      newStatus: infoLoader.status,
      newNotes: infoLoader.notes
    });

  }

  handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    this.setState({ [name]: value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const toggle = this.props.handleMe;
    toggle();
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': localStorage.getItem('react-context-jwt')
      },
      body: JSON.stringify(this.state)
    };

    fetch('/api/auth/edit-card', req)
      .then(res => res.json())
      .then(result => {
        const { handleCardEvents } = this.context;
        handleCardEvents();
      });
  }

  render() {
    const toggle = this.props.handleMe;
    const infoLoader = this.props.dataToLoadJob;
    const presetDate = infoLoader.dateApplied.substring(0, 10);
    return (
      <>
        <Modal
          show={true}
          onHide={toggle}
          backdrop="static"
          keyboard={false}
        >
          <Form onSubmit={this.handleSubmit}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Existing Job</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="newCompany"
                  defaultValue={infoLoader.company}
                  placeholder="Enter company name"
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPosition">
                <Form.Label>Position</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="newPosition"
                  defaultValue={infoLoader.position}
                  placeholder="Enter position applied for"
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicDate">
                <Form.Label>Date Applied</Form.Label>
                <Form.Control
                  required
                  type="date"
                  name="newDate"
                  defaultValue={presetDate}
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                {['radio'].map(type => (
                  <div key={`inline-${type}`} className="mb-3">
                    <Form.Check
                      defaultChecked={infoLoader.status === 'Active'}
                      required
                      inline
                      label="Active"
                      name="newStatus"
                      value="Active"
                      type={type}
                      id={`inline-${type}-1`}
                      onChange={this.handleChange}
                    />
                    <Form.Check
                      defaultChecked={infoLoader.status === 'Offered'}
                      inline
                      label="Offered"
                      name="newStatus"
                      value="Offered"
                      type={type}
                      id={`inline-${type}-2`}
                      onChange={this.handleChange}
                    />
                    <Form.Check
                      defaultChecked={infoLoader.status === 'Expired'}
                      inline
                      label="Expired"
                      name="newStatus"
                      value="Expired"
                      type={type}
                      id={`inline-${type}-3`}
                      onChange={this.handleChange}
                    />
                  </div>
                ))}
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicNotes">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows="4"
                  name="newNotes"
                  defaultValue={infoLoader.notes}
                  placeholder="Enter any notes"
                  onChange={this.handleChange}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={toggle}>
                Close
              </Button>
              <Button variant="primary" type="submit" >Save</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </>
    );
  }
}
EditCard.contextType = AppContext;
