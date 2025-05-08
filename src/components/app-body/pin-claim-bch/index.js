import React, { useCallback, useState } from 'react'
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

import AppUtil from '../../../util/index.js'
const appUtil = new AppUtil()

const PinClaim = ({ appData }) => {
  const { serverUrl } = appData
  const [writePriceData, setWritePriceData] = useState(null)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [onFetch, setOnFetch] = useState(false)
  const [cid, setCid] = useState(null)
  const [claimTxid, setClaimTxid] = useState(null)
  const [pobTxid, setPobTxid] = useState(null)

  const fetchWritePrice = useCallback(async (file) => {
    try {
      if (!file) { return }
      console.log('Calculating BCH cost for file')
      setError('')
      setWritePriceData(null)
      setOnFetch(true)
      const fileSizeInMegabytes = file.size / 10 ** 6 // get file size in MB
      const server = appData.fileStagerServerUrl
      const response = await axios.post(`${server}/ipfs/getBchCost`, {
        sizeInMb: fileSizeInMegabytes
      })

      const bchCost = response.data
      setWritePriceData({ bchCost })
      setOnFetch(false)
    } catch (error) {
      setOnFetch(false)
      console.error('Error fetching write price: ', error)
      setError('Error fetching write price.')
    }
  }, [appData.fileStagerServerUrl])

  const handleFileChange = async (e) => {
    console.log('handleFileChange')
    const selectedFile = e.target.files[0]
    // Calculate the pin claim price for the selected file
    setFile(selectedFile)
    if (selectedFile) {
      await fetchWritePrice(selectedFile)
    } else {
      setWritePriceData(null)
    }
    // update state after file changes
    console.log('reseting state')
    resetState()
  }

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

  const pinClaim = async (e) => {
    e.preventDefault()
    try {
      setOnFetch(true)
      setError('')
      const { wallet } = appData
      await wallet.initialize()
      const fileSizeInMegabytes = file.size / 10 ** 6 // get file size in MB
      const server = appData.fileStagerServerUrl
      const response = await axios.post(`${server}/ipfs/getPaymentAddr`, {
        sizeInMb: fileSizeInMegabytes
      })

      const { address, bchCost } = response.data

      const outputs = []
      outputs.push({
        address,
        amountSat: wallet.bchjs.BitcoinCash.toSatoshi(bchCost)
      })

      const txid = await wallet.send(outputs)
      console.log('txid: ', txid)

      // Wait for the transaction delay
      await appUtil.sleep(10000)

      // Generate a Pin Claim
      const pinObj = {
        cid,
        filename: file.name,
        address
      }
      const pinClaimResponse = await axios.post(`${server}/ipfs/createPinClaim`, pinObj)
      const { pobTxid, claimTxid } = pinClaimResponse.data

      setPobTxid(pobTxid)
      setClaimTxid(claimTxid)
      setError('')
      setOnFetch(false)
    } catch (error) {
      setOnFetch(false)
      console.error('Error uploading file: ', error)
      if (error?.response?.data.includes('balance')) {
        setError('Insufficient balance')
      } else {
        setError(error.message)
      }
    }
  }

  const resetState = () => {
    setCid(null)
    setClaimTxid(null)
    setPobTxid(null)
  }

  return (

    <Container className='mt-4 mb-4'>
      <h2>
        <FontAwesomeIcon icon={faCloudUploadAlt} className='me-2' />
        Upload and Pin Content
      </h2>

      <p>
        Use this page to upload a file and then pin it to the PSFFPP network.
        Note that your wallet must have BCH to pay for the pinning of content.
        Files must be less than 100MB is size. The cost to pin content is roughly
        $0.01 per MB, and pins last for one year. Pins can be renewed at any time.
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
              cursor: 'pointer'
            }}
          >
            <Form.Control
              type='file'
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id='fileInput'
            />
            <label htmlFor='fileInput' style={{ cursor: 'pointer', width: '100%' }}>

              {file && !onFetch && (
                <>
                  {file?.name && <p>{file.name}</p>}
                  <Button variant='outline-danger' type='button' onClick={(e) => { e.preventDefault(); setFile(null) }}>
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
          </Form.Text>
          {file && writePriceData && (
            <Form.Text className='text-muted'>
              <span>{file.name} Pin claim price: <strong>{writePriceData.bchCost} BCH</strong></span>

            </Form.Text>
          )}
        </Form.Group>

        {error && <Alert variant='danger'>{error}</Alert>}
        {cid && <Alert variant='success'>Upload Success : CID: {cid}</Alert>}
        {claimTxid && <Alert variant='success'>Pin Claim Success : Claim Txid: {claimTxid} </Alert>}

        {!cid && !claimTxid && !pobTxid && (
          <div className='d-flex justify-content-center'>
            <Button variant='primary' type='submit' onClick={uploadFile} disabled={!file || onFetch}>
              Upload File
            </Button>
          </div>
        )}
        {cid && !claimTxid && !pobTxid && (
          <div className='d-flex justify-content-center'>
            <Button variant='primary' type='submit' onClick={pinClaim} disabled={onFetch}>
              Pin File
            </Button>
          </div>
        )}
      </Form>
    </Container>
  )
}

export default PinClaim
