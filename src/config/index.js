/*
  Global configuration settings for this app.
*/

const config = {
  // Default IPFS CID for the app. This will be overwritten by dynamic lookup.
  ipfsCid: 'bafybeibya4cwro6rgqfaazqxckcchy6qo5sz2aqc4dx7ptcvpns5peqcz4',

  // BCH address used to point to the latest version of the IPFS CID.
  appBchAddr: 'bitcoincash:qztv87ppjh82v527jq2drp4u8rzzn63r5cmhth2zzm',

  // Backup Info that goes into the Footer.
  ghPagesUrl: 'https://permissionless-software-foundation.github.io/react-bootstrap-web3-spa/',
  ghRepo: 'https://github.com/Permissionless-Software-Foundation/explorer.psffpp.com',
  radicleUrl: 'https://app.radicle.network/seeds/maple.radicle.garden/rad:git:hnrkd5cjwwb5tzx37hq9uqm5ubon7ee468xcy/remotes/hyyycncbn9qzqmobnhjq9rry6t4mbjiadzjoyhaknzxjcz3cxkpfpc',

  // Default server url
  defaultServerUrl: 'https://free-bch.fullstack.cash',
  // defaultServerUrl: 'http://localhost:',

  // Default file stager server url
  defaultFileStagerServerUrl: 'https://file-stage.fullstack.cash'
  // defaultFileStagerServerUrl: 'http://localhost:5040'
}

export default config
