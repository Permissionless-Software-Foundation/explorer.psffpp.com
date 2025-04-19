// Global libraries
import React, { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import axios from 'axios'

// Local libraries
import ExplorerTable from './table'

const Explorer = ({ appData }) => {
  const [pins, setPins] = useState([])
  const [onFetch, setOnFetch] = useState(false)
  const [success, setSuccess] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (onFetch) return
        setOnFetch(true)
        console.log(appData.serverUrl)
        console.log(appData)
        const url = `${appData.serverUrl}/ipfs/pins/1`
        const response = await axios.get(url)
        const data = response.data
        console.log(data)
        if (!data.success) throw new Error(data.message)
        const pinsResponse = data.pins
        setPins(pinsResponse.pins)
        setSuccess(true)
        setOnFetch(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setOnFetch(false)
        setSuccess(true)
        setPins([])
      }
    }
    if (!onFetch && !success) {
      fetchData()
    }
  }, [appData, onFetch, success])

  return (
    <div>
      {!onFetch && success && <ExplorerTable pins={pins} appData={appData} />}
      {onFetch && (
        <div className='balance-spinner-container'>
          <Spinner animation='border' />
        </div>
      )}
    </div>
  )
}

export default Explorer
