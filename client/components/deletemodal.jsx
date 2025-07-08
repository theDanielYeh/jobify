import React from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import AppContext from '../lib/app-context';

export default class ConfirmDelete extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    const toggle = this.props.handleMe;
    toggle();
    const deleteId = this.props.dataToDelete;
    const { csrfToken, handleCardEvents } = this.context;
    const req = {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      }
    };

    fetch(`/api/auth/delete-card/${deleteId}`, req)
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
              <Modal.Title>Delete Card Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <h6>Are you sure you want to delete this card?</h6>
            </Modal.Body>
            <Modal.Footer className="modal-footer">
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
ConfirmDelete.contextType = AppContext;
