/**
 *
 * Table pagination component
 */
import React, { useState } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import '../../../App.css'

const Pagination = (props) => {
  // States
  const { onPageChange, onFetch } = props
  const [currentPage, setCurrentPage] = useState(1)

  const handlePageInput = (e) => {
    const value = e.target.value
    setCurrentPage(value)
  }

  const handleInputBlur = () => {
    let newPage = parseInt(currentPage)
    if (isNaN(newPage) || newPage < 1) {
      newPage = 1
    }
    setCurrentPage(newPage)
    onPageChange && onPageChange(newPage)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange && onPageChange(currentPage - 1)
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    onPageChange && onPageChange(currentPage + 1)
    setCurrentPage(currentPage + 1)
  }

  return (
    <div className='d-flex justify-content-end me-lg-4'>
      <div className='col-12 col-sm-4 col-md-3 col-lg-2 px-0'>
        <InputGroup className='pagination'>
          <Button
            variant='outline-secondary'
            className='pagination-btn'
            onClick={handlePrevPage}
            disabled={currentPage <= 0 || onFetch}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </Button>
          <FormControl
            className='pagination-input'
            value={currentPage}
            onChange={handlePageInput}
            onBlur={handleInputBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') { handleInputBlur() } }}
            disabled={onFetch}
          />
          <Button
            variant='outline-secondary'
            className='pagination-btn'
            onClick={handleNextPage}
            disabled={onFetch}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </Button>
        </InputGroup>
      </div>
    </div>
  )
}

export default Pagination
