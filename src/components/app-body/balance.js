/*
  Component for looking up the balance of a BCH address.
*/

// Global npm libraries
import React, { useState } from 'react'
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap'

function GetBalance (props) {
  const { wallet } = props

  // State
  const [balance, setBalance] = useState('')
  const [textInput, setTextInput] = useState('')

  // Button click handler
  const handleGetBalance = async (e) => {
    e.preventDefault()
    try {
      // Exit on invalid input
      if (!textInput) return
      if (!textInput.includes('bitcoincash:')) return

      setBalance(
        <div className='balance-spinner-container'>
          <span>Retrieving balance...</span>
          <Spinner animation='border' />
        </div>
      )

      const balance = await wallet.getBalance({ bchAddress: textInput })
      console.log('balance: ', balance)

      const bchBalance = wallet.bchjs.BitcoinCash.toBitcoinCash(balance)

      setBalance(`Balance: ${balance} sats, ${bchBalance} BCH`)
    } catch (err) {
      setBalance(<p><b>Error</b>: {`${err.message}`}</p>)
    }
  }

  return (
    <>
      <Container>
        <Row>
          <Col className='text-break' style={{ textAlign: 'center' }}>
            <Form onSubmit={handleGetBalance}>
              <Form.Group className='mb-3' controlId='formBasicEmail'>
                <Form.Label>Enter any BCH address to query its balance on the blockchain.</Form.Label>
                <Form.Control type='text' placeholder='bitcoincash:qqlrzp23w08434twmvr4fxw672whkjy0py26r63g3d' onChange={e => setTextInput(e.target.value)} />
              </Form.Group>

              <Button variant='primary' onClick={handleGetBalance}>
                Check Balance
              </Button>
            </Form>
          </Col>
        </Row>
        <br />
        <Row>
          <Col style={{ textAlign: 'center' }}>
            {balance}
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default GetBalance
