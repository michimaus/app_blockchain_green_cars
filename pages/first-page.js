import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Web3 from 'web3'
import tradingContract from "../blockchain/trade-platform.js"
import 'bulma/css/bulma.css'
import styles from "../styles/FirstPage.module.css"

const FirstPage = () => {
    const [error, setError] = useState('')
    const [web3, setWeb3] = useState(null)
    const [address, setAddress] = useState(null)
    const [contract, setContract] = useState(null)
    const [keccakc, setHash] = useState('')

    // window.ethereum
    const connectWalletHandler = async () => {
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" })
                web3 = new Web3(window.ethereum)
                setWeb3(web3)
                const accounts = await web3.eth.getAccounts();
                setAddress(accounts[0])
                window.ethereum.on('accountsChanged', function (accounts) {
                    setAddress(accounts[0])
                });
                const cntr = tradingContract(web3)
                setContract(cntr)
            } catch (err) {
                setError(err.message)
            }
        } else {
            // meta mask not installed
            console.log("Please install MetaMask");
        }
    }

    const checkWalletIsConnected = async () => {
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {
                const accounts = await window.ethereum.request({ method: "eth_accounts" })
                setAddress(accounts[0])
                window.ethereum.on('accountsChanged', function (accounts) {
                    setAddress(accounts[0])
                });
            } catch (err) {
                setError(err.message)
            }
        } else {
            // meta mask not installed
            console.log("Please install MetaMask");
        }
    }

    const connectWalletButton = () => {
        return (
            <button onClick={connectWalletHandler} className='button is-primary is-large'>Conectare</button>
        )
    }

    const buysellButtons = () => {
        return (
            <div className='buttons is-centered'>
                <Link href="/ev">
                    <div>
                        <button className='button is-primary is-large'>STATIE DE INCARCAT</button>
                    </div>
                </Link>
                <Link href="/cs">
                    <div>
                        <button className='button is-primary is-large'>FURNIZOR DE ENERGIE</button>
                    </div>
                </Link>
            </div>
        )
    }
    useEffect(() => {
        checkWalletIsConnected();
    }, [])

    return (
        <div className={styles.main}>
            <Head>
                <title>Trading platform App</title>
                <meta name="description" content="A blockchain trading platform app" />
                <style>{'body { background-color: #dff9fb; }'}</style>
            </Head>
            <section className="hero is-info is-fullheight">
                <div className="hero-head">
                    <nav className="navbar">
                        <div className="container">
                            <div className="navbar-brand">
                                <a className="navbar-item">
                                    <h1>Platforma de tranzactionare a energiei</h1>
                                </a>
                                <span className="navbar-burger" data-target="navbarMenuHeroB">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </div>
                            <div id="navbarMenuHeroC" className="navbar-menu">
                                <div className="navbar-end">
                                    <span className="navbar-item">
                                        {address ? <span className="tag is-link is-medium"> Adresa: {address} </span> : null}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="hero-body">
                    <div className="container has-text-centered">
                        <p className="title p-4">
                            {address ? <span className="is-size-2">Alege modul de simulare</span> : <span className="is-size-2">Trebuie sa te conectezi cu un portofel</span>}
                        </p>
                        <p className="subtitle">
                            {address ? buysellButtons() : connectWalletButton()}

                        </p>
                    </div>
                </div>

            </section>
        </div>
    )
}

export default FirstPage