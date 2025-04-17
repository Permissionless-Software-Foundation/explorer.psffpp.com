import React, { useEffect, useState } from 'react'
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'
import PSFFPP from 'psffpp/index.js'

const PinClaim = ({ appData }) => {
  const { serverUrl, wallet } = appData
  const [writePrice, setWritePrice] = useState(null)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [onFetch, setOnFetch] = useState(false)
  const [pinClaimPrice, setPinClaimPrice] = useState(null)
  const [cid, setCid] = useState(null)
  const [claimTxid, setClaimTxid] = useState(null)
  const [pobTxid, setPobTxid] = useState(null)

  // Get write price
  useEffect(() => {
    const fetchWritePrice = async () => {
      try {
        setOnFetch(true)
        const price = await wallet.getPsfWritePrice()
        console.log('price: ', price)
        setWritePrice(price)
        setOnFetch(false)
      } catch (error) {
        setOnFetch(false)
        console.error('Error fetching write price: ', error)
        setError('Error fetching write price.')
      }
    }
    fetchWritePrice()
  }, [wallet, writePrice])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    // Calculate the pin claim price for the selected file
    setFile(selectedFile)
    if (selectedFile) {
      const price = calculatePinClaimPrice(selectedFile.size, writePrice)
      setPinClaimPrice(price)
    } else {
      setPinClaimPrice(null)
    }
    // update state after file changes
    resetState()
  }
  // Calculate the pin claim price for the selected file
  const calculatePinClaimPrice = (fileSize, writePrice) => {
    // Calculate the write cost
    const fileSizeInMegabytes = (fileSize / 10 ** 6).toFixed(2)
    console.log('file size MB', fileSizeInMegabytes)
    const dataCost = writePrice * fileSizeInMegabytes
    console.log('datacost', dataCost)
    const minCost = writePrice
    console.log('minCost', minCost)
    let actualCost = minCost
    if (dataCost > minCost) actualCost = dataCost
    return actualCost.toFixed(8)
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

      const wallet = appData.wallet
      const psffpp = new PSFFPP({ wallet })

      const fileSizeInMegabytes = file.size / 10 ** 6 // get file size in MB
      // Generate a Pin Claim
      const pinObj = {
        cid,
        filename: file.name,
        fileSizeInMegabytes
      }
      const { pobTxid, claimTxid } = await psffpp.createPinClaim(pinObj)
      console.log('pobTxid: ', pobTxid)
      console.log('claimTxid: ', claimTxid)
      setPobTxid(pobTxid)
      setClaimTxid(claimTxid)
      setError('')
      setOnFetch(false)
    } catch (error) {
      setOnFetch(false)
      console.error('Error uploading file: ', error)
      setError(error.message)
    }
  }

  const resetState = () => {
    setCid(null)
    setClaimTxid(null)
    setPobTxid(null)
  }

  return (

    <Container className='mt-4'>
      <h2>
        <FontAwesomeIcon icon={faCloudUploadAlt} className='me-2' />
        Upload and Pin Content
      </h2>
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
          {file && (
            <Form.Text className='text-muted'>
              <span>{file.name} Pin claim price: <strong>{pinClaimPrice} PSF Tokens</strong></span>

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
