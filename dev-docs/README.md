# Developer Docs

This file contains notes taken during software development. These notes may eventually be edited into informaiton that goes into the top-level README, or other documentation.

## Main Features of this App

- [react-bootstrap](https://react-bootstrap.github.io/) is used for general style and layout control.
- An easily customizable waiting modal component can be invoked while waiting for network calls to complete.
- [minimal-slp-wallet](https://www.npmjs.com/package/minimal-slp-wallet) is used to access tokens and BCH on the Bitcoin Cash blockchain.
- A 'server selection' dropdown allows the user to select from an array of redundent back end servers.
- This site is statically compiled, uploaded to Filecoin, and served over IPFS for censorship resistance and version control.

## File Layout

The top-level file layout of this app looks like this:

- App.js - the main application orchestates these child components:
  - GetRestUrl - retrieves the REST URL for the selected back-end web3 server from query paramenters in the URL.
  - LoadScripts - Loads the modal with a waiting spinner animation until the external script files are loaded.
  - NavMenu - the collapsible navigation menu
  - InitializedView & UnitializedView - the default Views that are displayed depending on the state of the app.
  - ServerSelect - allows the user to select a different web3 back end server.
  - Footer - Footer links

After initialization, the InitailizedView is displayed. This loads the AppBody, which is a wrapper for each View. Views are selected using the navigation menu. When one View is selected, the others are hidden.

## Loading of Wallet
The wallet library [minimal-slp-wallet](https://www.npmjs.com/package/minimal-slp-wallet) is loaded at startup, and initialized with a web3 back end server. By default, the back-end server is free-bch.fullstack.cash. However, a list of back end servers provided by the [PSF](https://psfoundation.cash) are loaded into a drop-down from a GitHub

## Pinning a file (BCH payment, PS010 v2.0.0)

The `pin-claim` view and the `pin-claim-async` service implement the client side
of PS010 v2.0.0 Phase 1. The [file stager](https://github.com/Permissionless-Software-Foundation/ipfs-file-stager)
is the gateway:

1. The file is uploaded to the stager (`POST {stager}/ipfs/upload`), which returns
   a CID. The stager holds the file for 24 hours while the claim is made.
2. The view quotes the price with `POST {stager}/ipfs/getBchCost`, which returns
   `{ address, satsRequired }`. The address is the pin-service payout address and
   `satsRequired` already includes the locked 100 KB minimum charge.
3. On 'Pay and Pin File', the wallet sends exactly `satsRequired` satoshis to
   `address`. That payment txid is returned to the app.
4. The view calls `POST {stager}/ipfs/createPinClaim` with
   `{ cid, filename, paymentTxid }`. The stager verifies the payment pays the
   payout address and publishes the Pin Claim, returning `{ claimTxid }`.
5. The UI shows the payment txid and then the claim txid. The pin-service
   validates the payment and pins the file.

There is no PSF-token path: pins are paid in BCH (satoshis) only. The wallet does
not need any tokens to pin content; it only needs enough BCH to cover the price
plus the network fee.
