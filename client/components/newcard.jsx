import React from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import AppContext from '../lib/app-context';

export default class NewCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newCompany: '',
      newPosition: '',
      newDate: '',
      newStatus: '',
      newNotes: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    const { csrfToken, handleCardEvents } = this.context;
    const req = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(this.state)
    };
    fetch('/api/auth/new-card', req)
      .then(res => res.json())
      .then(result => {
        handleCardEvents();
      });
  }

  render() {
    const toggle = this.props.handleMe;
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
            <Modal.Title>New Applied Job</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="newCompany"
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
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                {['radio'].map(type => (
                  <div key={`inline-${type}`} className="mb-3">
                    <Form.Check
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
                      inline
                      label="Offered"
                      name="newStatus"
                      value="Offered"
                      type={type}
                      id={`inline-${type}-2`}
                      onChange={this.handleChange}
                    />
                    <Form.Check
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

NewCard.contextType = AppContext;
