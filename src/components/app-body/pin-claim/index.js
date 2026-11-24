/**
 *  This component is used to upload and pin a file, paid in BCH.
 */

import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'
import PinClaimAsync from '../../../services/pin-claim-async'

const PinClaim = ({ appData }) => {
  const { serverUrl } = appData
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [onFetch, setOnFetch] = useState(false)
  const [pinClaimPrice, setPinClaimPrice] = useState(null)
  const [cid, setCid] = useState(null)
  const [claimTxid, setClaimTxid] = useState(null)
  const [paymentTxid, setPaymentTxid] = useState(null)

  const fileInputRef = useRef(null)

  // Instance of pin claim service
  const pinClaimAsync = useMemo(() => {
    return new PinClaimAsync({
      server: appData.fileStagerServerUrl,
      wallet: appData.wallet
    })
  }, [appData.fileStagerServerUrl, appData.wallet])

  // Handle file change
  const handleFileChange = async (e) => {
    try {
      const selectedFile = e.target.files[0]
      // Set the file and reset price - useEffect will calculate the new price
      setFile(selectedFile)
      setPinClaimPrice(null)
      // update state after file changes
      resetState()
    } catch (error) {
      setError(error.message)
      console.error('Error uploading file: ', error)
    }
  }

  // Get a price quote for the selected file from the file stager. The quote is
  // { address, satsRequired }; the 100 KB floor is already included.
  const calculatePinClaimPrice = useCallback(async (file) => {
    return await pinClaimAsync.fetchBchCost(file)
  }, [pinClaimAsync])

  // Submit the pin claim
  const submitPinClaim = async (file, cid) => {
    try {
      setOnFetch(true)

      const result = await pinClaimAsync.pinClaimBCH(file, cid)
      console.log('paymentTxid: ', result.paymentTxid)
      console.log('claimTxid: ', result.claimTxid)

      setPaymentTxid(result.paymentTxid)
      setClaimTxid(result.claimTxid)
      setError('')
      setOnFetch(false)
    } catch (error) {
      setOnFetch(false)
      setError(error.message)
      console.error('Error pinning file: ', error)
    }
  }

  // Upload the file to the server
  const uploadFile = async (e) => {
    e.preventDefault()
    try {
      if (!file) { throw new Error('Please select a file to upload') }
      setOnFetch(true)

      const data = new FormData()
      data.append('file', file)

      console.log('serverURL: ', serverUrl)
      const server = appData.fileStagerServerUrl
      const response = await fetch(`${server}/ipfs/upload`, {
        method: 'POST',
        body: data
      })
      const result = await response.json()
      const cid = result.cid
      setCid(cid)
      setOnFetch(false)
    } catch (error) {
      setOnFetch(false)
      console.error('Error uploading file: ', error)
      setError(error.message)
    }
  }

  // Reset the state
  const resetState = () => {
    setCid(null)
    setClaimTxid(null)
    setPaymentTxid(null)
    setError('')
  }

  // Remove the file from the input
  const removeFile = (e) => {
    e.preventDefault()
    setFile(null)
    resetState()
    // remove file from input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Calculate the pin claim price for the selected file
  // This is called when the file changes to update the pin claim price
  useEffect(() => {
    try {
      const calculatePrice = async () => {
        if (file) {
          console.log('pin-claim/index.js/useEffect() file.size: ', file.size)

          setPinClaimPrice(null)

          const price = await calculatePinClaimPrice(file)
          setPinClaimPrice(price)
        } else {
          setPinClaimPrice(null)
        }
      }
      calculatePrice()
    } catch (error) {
      console.error('Error calculating pin claim price: ', error)
      setError(error.message)
    }
  }, [file, calculatePinClaimPrice])

  // Render the component
  return (
    <Container className='mt-4 mb-4'>
      <h2>
        <FontAwesomeIcon icon={faCloudUploadAlt} className='me-2' />
        Upload and Pin Content
      </h2>

      <p>
        Use this page to upload a file and then pin it to the PSFFPP network.
        Pinning is paid in BCH (satoshis); your wallet does not need any tokens.
        Files must be less than 100MB in size. The cost to pin content is roughly
        $0.01 per MB, with a 100 KB minimum, and pins last for one year. Pins can
        be renewed at any time.
      </p>

      <Form>
        <Form.Group className='mb-3'>
          <div
            style={{
              border: '2px dashed #ccc',
              borderRadius: '4px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: 'white',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Form.Control
              ref={fileInputRef}
              type='file'
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id='fileInput'
            />
            <label htmlFor='fileInput' style={{ cursor: 'pointer', width: '100%' }}>

              {file && !onFetch && (
                <>
                  {file?.name && <p>{file.name}</p>}
                  <Button variant='outline-danger' type='button' onClick={removeFile}>
                    Remove
                  </Button>

                </>
              )}

              {
                !file && !onFetch && (
                  <div>
                    <p>Drag and drop your file here</p>
                    <p>or</p>
                    <Button variant='outline-primary' type='button' onClick={() => document.getElementById('fileInput').click()}>
                      Browse Files
                    </Button>
                  </div>
                )
              }
              {onFetch && (
                <div className='balance-spinner-container'>
                  <Spinner animation='border' />
                </div>
              )}
            </label>
          </div>
          <Form.Text className='text-muted'>
            <span>
              Select and Upload a file to pin it over the PSF File Pinning Service (PSFFPP) cluster on the IPFS network.
            </span>
            <br />
            <span>Selected Server : {appData.fileStagerServerUrl}</span>
            <br />
            {file && (
              <span>
                {file.name} Pin claim price: {' '}
                {pinClaimPrice === null
                  ? (
                    <Spinner animation='border' size='sm' />
                    )
                  : (
                    <strong>
                      {pinClaimPrice.satsRequired} sats
                      {' '}
                      ({pinClaimPrice.satsRequired / 10 ** 8} BCH)
                    </strong>
                    )}
              </span>
            )}
          </Form.Text>

        </Form.Group>

        {error && <Alert variant='danger'>{error}</Alert>}
        {cid && <Alert variant='success'>Upload Success : CID: {cid}</Alert>}
        {paymentTxid && <Alert variant='success'>Payment Sent : Payment Txid: {paymentTxid} </Alert>}
        {claimTxid && <Alert variant='success'>Pin Claim Success : Claim Txid: {claimTxid} </Alert>}

        {!cid && !claimTxid && !paymentTxid && (
          <div className='d-flex justify-content-center'>
            <Button variant='primary' type='submit' onClick={uploadFile} disabled={!file || onFetch}>
              Upload File
            </Button>
          </div>
        )}
        {cid && !claimTxid && !paymentTxid && (
          <div className='d-flex justify-content-center'>
            <Button variant='primary' type='submit' onClick={(e) => submitPinClaim(file, cid)} disabled={onFetch}>
              Pay and Pin File
            </Button>
          </div>
        )}
      </Form>
    </Container>
  )
}

export default PinClaim
