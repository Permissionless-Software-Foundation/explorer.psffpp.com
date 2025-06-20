/**
 * This service is used to pin a file with BCH or PSF payment
 */
import axios from 'axios'
import PSFFPP from 'psffpp/index.js'
import AppUtil from '../util/index.js'
const appUtil = new AppUtil()

class PinClaimAsync {
  constructor (inObj = {}) {
    this.wallet = inObj.wallet
    this.server = inObj.server
  }

  async fetchBCHWritePrice (file) {
    try {
      if (!file) { return }
      console.log('Calculating BCH cost for file')

      const fileSizeInMegabytes = file.size / 10 ** 6 // get file size in MB
      const response = await axios.post(`${this.server}/ipfs/getBchCost`, {
        sizeInMb: fileSizeInMegabytes
      })

      const bchCost = response.data
      console.log(`Bch Cost ${bchCost}`)
      return bchCost
    } catch (error) {
      console.log('Error fetching BCH cost', error)
      throw error
    }
  }

  async fetchPSFWritePrice (file) {
    try {
      if (!file) { return }
      console.log('Calculating PSF cost for file')

      const writePrice = await this.wallet.getPsfWritePrice()
      console.log('price: ', writePrice)
      const fileSizeInMegabytes = (file.size / 10 ** 6).toFixed(2)
      console.log('file size MB', fileSizeInMegabytes)
      const dataCost = writePrice * fileSizeInMegabytes
      console.log('datacost', dataCost)
      const minCost = writePrice
      console.log('minCost', minCost)
      let actualCost = minCost
      if (dataCost > minCost) actualCost = dataCost

      const psfCost = actualCost.toFixed(8)
      console.log(`PSF Cost ${psfCost}`)

      return psfCost
    } catch (error) {
      console.log('Error fetching PSF cost', error)
      throw error
    }
  }

  async pinClaimBCH (file, cid) {
    try {
      await this.wallet.initialize()

      console.log('Try to pin file with BCH Payment')
      const fileSizeInMegabytes = file.size / 10 ** 6 // get file size in MB
      const response = await axios.post(`${this.server}/ipfs/getPaymentAddr`, {
        sizeInMb: fileSizeInMegabytes
      })

      const { address, bchCost } = response.data

      const outputs = []
      outputs.push({
        address,
        amountSat: this.wallet.bchjs.BitcoinCash.toSatoshi(bchCost)
      })

      const txid = await this.wallet.send(outputs)
      console.log('txid: ', txid)

      // Wait for the transaction delay
      await appUtil.sleep(10000)

      // Generate a Pin Claim
      const pinObj = {
        cid,
        filename: file.name,
        address
      }
      const pinClaimResponse = await axios.post(`${this.server}/ipfs/createPinClaim`, pinObj)
      const { pobTxid, claimTxid } = pinClaimResponse.data

      return { pobTxid, claimTxid }
    } catch (error) {
      console.log('Error pinning file with BCH', error)
      throw error
    }
  }

  async pinClaimPSF (file, cid) {
    try {
      console.log('Try to pin file with PSF Payment')
      const psffpp = new PSFFPP({ wallet: this.wallet })

      const fileSizeInMegabytes = file.size / 10 ** 6 // get file size in MB
      // Generate a Pin Claim
      const pinObj = {
        cid,
        filename: file.name,
        fileSizeInMegabytes
      }
      const { pobTxid, claimTxid } = await psffpp.createPinClaim(pinObj)

      return { pobTxid, claimTxid }
    } catch (error) {
      console.log('Error pinning file with PSF', error)
      throw error
    }
  }
}

export default PinClaimAsync
