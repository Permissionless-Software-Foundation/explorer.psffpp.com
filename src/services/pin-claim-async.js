/**
 * This service is used to pin a file to the PSFFPP network, paid in BCH.
 *
 * PS010 v2.0.0 Phase 1: the file stager is the gateway. It quotes the cost in
 * satoshis (from the pin-service), the wallet pays that amount to the payout
 * address, and the stager publishes the Pin Claim with the payment txid.
 */
import axios from 'axios'
import AppUtil from '../util/index.js'
const appUtil = new AppUtil()

class PinClaimAsync {
  constructor (inObj = {}) {
    this.wallet = inObj.wallet
    this.server = inObj.server
  }

  // Get a price quote from the file stager: the BCH payout address and the
  // amount to pay, in satoshis. The amount already includes the 100 KB minimum
  // charge, so no floor is applied here.
  async fetchBchCost (file) {
    try {
      if (!file) { return }
      console.log('Calculating BCH cost for file')

      const sizeInMb = file.size / 10 ** 6 // get file size in MB
      const response = await axios.post(`${this.server}/ipfs/getBchCost`, {
        sizeInMb
      })

      const { address, satsRequired } = response.data
      console.log(`Quote: ${satsRequired} sats to ${address}`)

      if (!address) {
        throw new Error('The file stager did not return a payment address.')
      }
      if (!satsRequired) {
        throw new Error('The file stager did not return the required sats.')
      }

      return { address, satsRequired }
    } catch (error) {
      console.log('Error fetching BCH cost', error)
      throw error
    }
  }

  // Pay for the pin in BCH, then have the file stager publish the Pin Claim.
  //
  // 1. Quote the price (address + sats) from the stager.
  // 2. Send exactly that many sats to the payout address.
  // 3. Ask the stager to publish the claim, referencing the payment txid.
  async pinClaimBCH (file, cid) {
    try {
      await this.wallet.initialize()

      console.log('Try to pin file with BCH Payment')
      const { address, satsRequired } = await this.fetchBchCost(file)

      const outputs = []
      outputs.push({
        address,
        amountSat: satsRequired
      })

      const paymentTxid = await this.wallet.send(outputs)
      console.log('paymentTxid: ', paymentTxid)

      // Wait for the payment to propagate before the claim is generated.
      await appUtil.sleep(10000)

      // Generate a Pin Claim
      const pinObj = {
        cid,
        filename: file.name,
        paymentTxid
      }
      const pinClaimResponse = await axios.post(`${this.server}/ipfs/createPinClaim`, pinObj)
      const { claimTxid } = pinClaimResponse.data

      return { paymentTxid, claimTxid }
    } catch (error) {
      console.log('Error pinning file with BCH', error)
      throw error
    }
  }
}

export default PinClaimAsync
