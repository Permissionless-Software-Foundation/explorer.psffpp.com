import React, { useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark, faThumbtack, faClock, faCopy } from '@fortawesome/free-solid-svg-icons'
import '../../../App.css'

const CustomCopyOnClick = (props) => {
  // State
  const [iconVis, setIconVis] = useState(true)
  // Props
  const { appData, value } = props
  // App Util
  const { appUtil } = appData

  // Function to copy the value to the clipboard.
  const handleCopyToClipboard = useCallback(async (event) => {
    appUtil.copyToClipboard(value)

    // hide icon in order to show the copied message
    setIconVis(false)

    // restart icon visibility after 1 second
    setTimeout(function () {
      setIconVis(true)
    }, 1000)
  }, [value, appUtil])

  return (
    <>
      {iconVis && (
        <FontAwesomeIcon
          icon={faCopy} size='lg'
          id='table-icon'
          onClick={(e) => handleCopyToClipboard(e)}
          style={{ cursor: 'pointer', color: '#6366f1' }}
        />
      )}
      {!iconVis && (
        <span
          id='table-word'
          style={{ color: 'green' }}
        >
          Copied!
        </span>
      )}
    </>
  )
}

const ExplorerTable = ({ pins, appData }) => {
  const truncateCid = (cid) => {
    return <a href={`${appData.serverUrl}/ipfs/file-info/${cid}`} target='_blank' rel='noopener noreferrer'>{cid.slice(0, 4)}...{cid.slice(-4)}</a>
  }

  const handleView = (pin) => {
    window.open(`${appData.serverUrl}/ipfs/view/${pin.cid}`, '_blank')
  }

  const handleDownload = (pin) => {
    window.open(`${appData.serverUrl}/ipfs/download/${pin.cid}`, '_blank')
  }
  const formatDate = (date) => {
    return new Date(date).toLocaleString()
  }
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    if (mb < 0.01) {
      const kb = bytes / 1024
      return `${kb.toFixed(2)} KB`
    }
    return `${mb.toFixed(2)} MB`
  }
  return (
    <div className='explorer-table-container mb-4'>
      <table className='explorer-table'>
        <thead>
          <tr className='explorer-table-header'>
            <th className='explorer-table-cell'>File Name</th>
            <th className='explorer-table-cell'>File Size</th>
            <th className='explorer-table-cell'>Recorded</th>
            <th className='explorer-table-cell'>Valid</th>
            <th className='explorer-table-cell'>Pinned</th>
            <th className='explorer-table-cell'>CID</th>
            <th className='explorer-table-cell'>View</th>
            <th className='explorer-table-cell text-center'>Download</th>
          </tr>
        </thead>
        <tbody>
          {pins?.map((pin, index) => (
            <tr key={index} className='explorer-table-row'>
              <td className='explorer-table-cell'>{pin.filename}</td>
              <td className='explorer-table-cell'>{formatFileSize(pin.fileSize)}</td>
              <td className='explorer-table-cell'>{formatDate(pin.recordTime)}</td>
              <td className='explorer-table-cell'>
                {pin.validClaim
                  ? (
                    <FontAwesomeIcon icon={faCheck} className='check-icon' />
                    )
                  : (
                    <FontAwesomeIcon icon={faXmark} className='xmark-icon' />
                    )}
              </td>
              <td className='explorer-table-cell'>
                {pin.dataPinned
                  ? (
                    <FontAwesomeIcon icon={faThumbtack} className='pin-icon' />
                    )
                  : (
                    <FontAwesomeIcon icon={faClock} className='clock-icon' />
                    )}
              </td>
              <td className='explorer-table-cell'><span>{truncateCid(pin.cid)}</span><CustomCopyOnClick value={pin.cid} appData={appData} /></td>
              <td className='explorer-table-cell'>
                <button
                  onClick={() => handleView(pin)}
                  className='action-button view-button'
                >
                  View
                </button>
              </td>
              <td className='explorer-table-cell text-center'>
                <button
                  onClick={() => handleDownload(pin)}
                  className='action-button download-button'
                >
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ExplorerTable
