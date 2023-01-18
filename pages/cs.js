import Link from 'next/link'
import Head from 'next/head'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import tradingContract from "../blockchain/trade-platform.js"
import 'bulma/css/bulma.css'
import styles from "../styles/FirstPage.module.css"
import BasicCard from '../components/request-card.js'
import { Box } from '@mui/system'

const CS = () => {
    const [error, setError] = useState('')
    const [web3, setWeb3] = useState(null)
    const [address, setAddress] = useState(null)
    const [contract, setContract] = useState(null)
    const [state, setState] = useState(0)
    const [request, setRequest] = useState()
    const [resultRefresh, setResultRefresh] = useState()
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [aucID, setAucID] = useState(-1);
    const [balance, setBalance] = useState(0);
    const handleOpen1 = () => setOpen1(true);
    const handleOpen2 = () => setOpen2(true);
    const handleClose = () => {
        setOpen1(false);
        setOpen2(false);
    };


    useEffect(() => {
        connectWalletHandler()
    }, []);

    const showData = resultRefresh ? (resultRefresh.map((dt) =>
        < Box my={3} >
            <BasicCard address={address} buyer={dt.buyer} handleOpen1={handleOpen1} handleOpen2={handleOpen2} handleClose={handleClose} open1={open1} open2={open2} amount={dt.amount} price={dt.price} aucId={dt.aucId} state={state} setError={setError} setState={setState} web3={web3} contract={contract} />
        </Box >)) : null


    const refreshRequest = async () => {
        const dataRes = await contract.methods.getNumberOfReq().call();
        let dataArr = []
        dataRes[0].forEach((address, index) =>
            dataArr.push({ buyer: address, price: dataRes[1][index], amount: dataRes[2][index], aucId: dataRes[3][index] }))
        setResultRefresh(dataArr)
        console.log(dataRes)
    }

    // window.ethereum
    const connectWalletHandler = async () => {
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" })
                web3 = new Web3(window.ethereum)
                setWeb3(web3)
                const accounts = await web3.eth.getAccounts();
                console.log("connectWalletHandler Accounts: " + accounts);
                setAddress(accounts[0])
                console.log("connectWalletHandler Address: " + address);
                window.ethereum.on('accountsChanged', function (accounts) {
                    // Time to reload your interface with accounts[0]!
                    setAddress(accounts[0])
                    console.log("connectWalletHandler Address Changed: " + address);
                });
                const cntr = tradingContract(web3)
                console.log("connectWalletHandler Cntr: " + cntr);
                setContract(cntr)
                const dataRes = contract.methods.getNumberOfReq().call();
                console.log("connectWalletHandler Contract: " + contract);
                console.log("connectWalletHandler Address: " + address)
                console.log("End connectWalletHandler");
            } catch (err) {
                setError(err.message)
            }
        } else {
            // meta mask not installed
            console.log("Please install MetaMask");
        }
    }



    return (
        <div className={styles.main}>
            <Head>
                <title>Trading platform App</title>
                <meta name="description" content="A blockchain trading platform app" />
            </Head>
            <section className="hero is-info is-fullheight">
                <div className="hero-head">
                    <nav className="navbar">
                        <div className="container">
                            <div className="navbar-brand">
                                <div className="navbar-item">
                                    <h1>Platforma de tranzactionare a energiei</h1>
                                </div>
                                <span className="navbar-burger" data-target="navbarMenuHeroB">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </div>
                            <div id="navbarMenuHeroC" className="navbar-menu">
                                <div className="navbar-end">
                                    <span className="navbar-item">
                                        {address ? <span className="tag is-link is-medium"> Adresa: {address} </span> : null} <br />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>



                <div className="hero-body">
                    <div className="container has-text-centered">
                        <span className="is-size-2">Cereri active</span>
                        <button onClick={refreshRequest} className='button is-large is-warning mb-4 ml-4'>Actualizare oferte</button> <br />
                        {showData}
                        <Link href="/first-page">
                            <div className='container mt-4'>
                                <button className='button is-large is-primary'>Inapoi</button> <br />
                            </div>
                        </Link>

                    </div>
                </div>

            </section>
        </div>
    )
}

export default CS