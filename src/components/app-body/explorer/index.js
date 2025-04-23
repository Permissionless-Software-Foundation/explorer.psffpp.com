// Global libraries
import React, { useEffect, useState, useCallback } from 'react'
import { Spinner } from 'react-bootstrap'
import Pagination from './pagination'
import axios from 'axios'

// Local libraries
import ExplorerTable from './table'

const Explorer = ({ appData }) => {
  const [pins, setPins] = useState([]) // pins data
  const [onFetch, setOnFetch] = useState(false) // Flag for prevent multiple fetch
  const [success, setSuccess] = useState(false) // Flag for prevent multiple fetch on component mount
  const [error, setError] = useState(null) // error message
  // Fetch data from the server
  const fetchData = useCallback(async (toPage = 1) => {
    try {
      console.log('toPage', toPage)
      if (onFetch) return
      setOnFetch(true)
      // fetch data from the server
      const url = `${appData.serverUrl}/ipfs/pins/${toPage}`
      const response = await axios.get(url)
      const data = response.data
      if (!data.success) throw new Error(data.message)
      const pinsResponse = data.pins

      // update the pins state
      setPins(pinsResponse.pins)
      setSuccess(true)
      setOnFetch(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setOnFetch(false)
      setSuccess(true)
      setError(error.message)
      setPins([])
    }
  }, [onFetch, appData.serverUrl])

  // Fetch data when the component mounts
  useEffect(() => {
    if (!onFetch && !success) {
      fetchData()
    }
  }, [appData, onFetch, success, fetchData])

  return (
    <div>
      {success && !error && <Pagination pins={pins} appData={appData} onPageChange={fetchData} onFetch={onFetch} />}
      {!onFetch && success && !error && <ExplorerTable pins={pins} appData={appData} />}
      {onFetch && (
        <div style={{ height: '70vh' }} className='balance-spinner-container d-flex justify-content-center align-items-center'>
          <Spinner animation='border' />
        </div>
      )}
      {error && !onFetch && <div style={{ color: 'red' }} className='error-message d-flex justify-content-center align-items-center'>{error}</div>}
      {success && !error && (
        <div className='d-flex justify-content-center align-items-center'>
          <span className='text-muted'>No IPFS pins found.</span>
        </div>
      )}
    </div>
  )
}

export default Explorer
