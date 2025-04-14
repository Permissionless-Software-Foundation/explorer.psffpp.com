import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark, faThumbtack, faClock } from '@fortawesome/free-solid-svg-icons'
import '../../../App.css'

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

  return (
    <div className='explorer-table-container'>
      <table className='explorer-table'>
        <thead>
          <tr className='explorer-table-header'>
            <th className='explorer-table-cell'>Filename</th>
            <th className='explorer-table-cell'>Recorded</th>
            <th className='explorer-table-cell'>Valid</th>
            <th className='explorer-table-cell'>Pinned</th>
            <th className='explorer-table-cell'>CID</th>
            <th className='explorer-table-cell'>View</th>
            <th className='explorer-table-cell'>Download</th>
          </tr>
        </thead>
        <tbody>
          {pins?.map((pin, index) => (
            <tr key={index} className='explorer-table-row'>
              <td className='explorer-table-cell'>{pin.filename}</td>
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
              <td className='explorer-table-cell'>{truncateCid(pin.cid)}</td>
              <td className='explorer-table-cell'>
                <button
                  onClick={() => handleView(pin)}
                  className='action-button view-button'
                >
                  View
                </button>
              </td>
              <td className='explorer-table-cell'>
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
