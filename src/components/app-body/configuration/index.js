/*
 This component is a View that allows the user to handle configuration
 settings for the app.
*/

// Global npm libraries
import React, { useRef } from 'react'
import ServerSelectView from './select-server-view'
import SelectFileStagerView from './select-file-stager-view'

function ConfigurationView (props) {
  const { appData } = props

  // Refs for the onSubmit functions from the child components
  const onSubmitServerRef = useRef(null)
  const onSubmitStageRef = useRef(null)

  // Function to submit all the forms
  const onSubmitAll = () => {
    onSubmitStageRef.current?.()
    setTimeout(() => { onSubmitServerRef.current?.() }, 100)
  }

  return (
    <>
      <ServerSelectView appData={appData} onSubmitRef={onSubmitServerRef} onSubmitAll={onSubmitAll} />
      <SelectFileStagerView appData={appData} onSubmitRef={onSubmitStageRef} />
    </>
  )
}

export default ConfigurationView
