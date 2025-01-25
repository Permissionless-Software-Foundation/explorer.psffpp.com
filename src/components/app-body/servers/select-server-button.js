/*
  This component contains a drop-down form that lets the user select from
  a range of Global Back End servers.
*/

// Global npm libraries
import React from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'

const ServerSelect = (props) => {
  const { appData } = props

  // This is a click handler for the server select button. It brings up the
  // server selection View.
  const handleServerSelect = () => {
    console.log('This function should navigate to the server selection view.')
    appData.setMenuState(100)
  }

  return (
    <Container>
      <hr />
      <Row>
        <Col style={{ textAlign: 'center', padding: '25px' }}>
          <br />
          <h5>
            Having trouble loading? Try selecting a different back-end server.
          </h5>
          <Button variant='warning' onClick={handleServerSelect}>
            Select a different back end server
          </Button>
          <br />
        </Col>
      </Row>
    </Container>
  )
}

export default ServerSelect
