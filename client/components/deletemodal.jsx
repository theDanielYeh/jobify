import React, { useState } from 'react';
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
    console.log('deleteModal deleterId: ', deleteId);
    const req = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': localStorage.getItem('react-context-jwt')
      }
    };

    fetch(`/api/auth/delete-card/${deleteId}`, req)
      .then(result => {
        console.log('deleteModal handleSubmit fetch returned.');
        const { handleCardEvents } = this.context;
        handleCardEvents();
        // if (action === 'sign-up') {
        //   window.location.hash = 'sign-in';
        // } else if (result.user && result.token) {
        //   this.props.onSignIn(result);
        // }
        // if (result.user && result.token) {
        //   const { handleSignIn } = this.context;
        //   handleSignIn(result);
      }
        // }
      );
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
            <h3>Are you sure you want to delete this card?</h3>
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
