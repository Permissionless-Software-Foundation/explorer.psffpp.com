/*
  This component is a View that allows the user to select a back end server
  from a list of servers.
*/

// Global npm libraries
import React, { useState, useEffect, useCallback } from 'react'
import { Row, Col, Form, Card } from 'react-bootstrap'

function ServerSelectView (props) {
  const { appData, onSubmitRef, onSubmitAll } = props
  const [selectedServer, setSelectedServer] = useState(appData.serverUrl)
  const servers = appData.servers

  // Update server when dropdown selection changes
  const handleServerChange = (event) => {
    setSelectedServer(event.target.value)
  }

  const onSaveServer = useCallback((serverUrl) => {
    appData.updateLocalStorage({ serverUrl })
    window.location.href = '/'
  }, [appData])

  // Add onSaveServer to onSubmitRef
  // This is used to submit the form when the user clicks the  global save button
  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = () => onSaveServer(selectedServer)
    }
  }, [selectedServer, onSubmitRef, onSaveServer])

  return (
    <>
      <Card className='m-3'>
        <Row className='mb-3 mt-3 mx-3'>
          <Col className='text-end'>
            <button
              className='btn btn-primary'
              style={{ minWidth: '100px' }}
              onClick={() => onSubmitAll()}
            >
              Save
            </button>
          </Col>
        </Row>

        <Card.Body>
          <Row>
            <Col style={{ textAlign: 'center' }}>
              <h2>Configuration</h2>
              <p>
                This page allows you to change configuration settings for different
                back end services. This page is for advanced users only.
              </p>
            </Col>
          </Row>
          <hr />

          <Row className='justify-content-center'>
            <Col xs={12} md={6}>
              <p>
                Select an alternative server below. The app will reload and use
                the selected server.
              </p>
              <Form.Select
                value={selectedServer}
                onChange={handleServerChange}
                className='mb-3'
              >
                {servers.map((server, i) => (
                  <option key={`server-${i}`} value={server.value}>
                    {server.value === appData.serverUrl ? `${server.label} (current)` : server.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Row className='justify-content-center mt-3'>
            <Col xs={12} md={6} className='text-center'>
              <button
                className='btn btn-primary'
                style={{ minWidth: '100px' }}
                onClick={() => onSaveServer(selectedServer)}
              >
                Save
              </button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  )
}

export default ServerSelectView
