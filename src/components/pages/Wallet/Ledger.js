import React, { useState, useContext } from 'react'
import { Icon as AntIcon, Row, Col, message } from 'antd'
import { ledger, crypto } from '@binance-chain/javascript-sdk'
import u2f_transport from '@ledgerhq/hw-transport-u2f'

import { Context } from '../../../context'
import { Icon, Button, Text } from '../../Components'

ledger.transports.u2f = u2f_transport
window.ledger = ledger

const Connector = props => {
  const context = useContext(Context)
  const [connecting, setConnecting] = useState(false)

  const ledgerConnect = async () => {
    setConnecting(true)

    // use the u2f transport
    const timeout = 50000
    const transport = await ledger.transports.u2f.create(timeout)
    const app = window.app = new ledger.app(transport, 100000, 100000)

    // get version
    try {
      const version = await app.getVersion()
      console.log("version", version)
    } catch ({ message, statusCode }) {
      console.error("version error", message, statusCode)
    }

    // we can provide the hd path (app checks first two parts are same as below)
    const hdPath = window.hdPath = [44, 714, 0, 0, 0]

    // select which address to use
    const results = await app.showAddress("bnb", hdPath)
    console.log("Results:", results)

    // get public key
    let pk
    try {
      pk = (await app.getPublicKey(hdPath)).pk

      // get address from pubkey
      const address = crypto.getAddressFromPublicKey(pk)
      console.log("address", address)

      context.setContext({
        "wallet": {
          "address": address,
          "ledger": app,
          "hdPath": hdPath,
        }
      }, () => {
        setConnecting(false)
        props.history.push("/")
      })
    } catch (err) {
      console.error("pk error", err.message, err.statusCode)
      message.error("public key error" + err.message)
      setConnecting(false)
      return
    }
  }

  const ledgerCSS = {
    padding: 10
  }

  return (
    <div>
      <Row style={{marginBottom: 20}}>
        <Text size={18}>Connect your Ledger device</Text>
      </Row>
      <Row>
        <Col span={3}>
          <Icon icon="step1" alt="Step 1"/>
        </Col>
        <Col span={8}>
          <Text bold>Enter PIN Code</Text>
        </Col>
        <Col>
          <Icon icon="pincode" style={ledgerCSS} />
        </Col>
      </Row>
      <Row style={{marginTop: 20}}>
        <Col span={3}>
          <Icon icon="step2" alt="Step 2" />
        </Col>
        <Col span={8}>
          <Row>
            <Text bold>Open Binance Chain</Text>
          </Row>
          <Row>
            <Text size={10}>
              “Binance Chain Ready” must be on-screen
            </Text>
          </Row>
        </Col>
        <Col>
          <Icon icon="openapp" alt="" style={ledgerCSS} />
        </Col>
      </Row>
      <Row style={{marginTop: 20}}>
        <Col span={12}>
          <div>
            <a 
              href="https://www.binance.org/static/guides/DEX-Ledger-Documentation.html" 
              rel="noopener noreferrer"
              target="_blank"
            >
              <Text size={10} color="#F0B90B">
                App Installation & Usage Instructions
              </Text>
            </a>
          </div>
          <div>
            <a 
              href="https://support.ledger.com/hc/en-us/articles/115005165269-Connection-issues-with-Windows-or-Linux" 
              rel="noopener noreferrer"
              target="_blank"
            >
              <Text size={10} color="#F0B90B">
                Having Connection Issues?
              </Text>
            </a>
          </div>
        </Col>
        <Col span={12}>
          <Button 
            onClick={ledgerConnect} 
            loading={connecting}
            fill={true}
          >
            Connect to Ledger <AntIcon type="arrow-right" />
          </Button>
        </Col>
      </Row>
    </div>
  )
}

export default Connector
