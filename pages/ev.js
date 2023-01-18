import Link from 'next/link'
import Web3 from 'web3'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import tradingContract from "../blockchain/trade-platform.js"
import 'bulma/css/bulma.css'
import styles from "../styles/FirstPage.module.css"
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import SignUp from '../components/request.js'
import Winner from '../components/winner.js'
import { valueToPercent } from '@mui/base'

const EV = () => {
    const [error, setError] = useState('')
    const [web3, setWeb3] = useState(null)
    const [address, setAddress] = useState(null)
    const [contract, setContract] = useState(null)
    const [state, setState] = useState(0)
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [aucID, setAucID] = useState(-1);
    const [winnerAddress, setWinnerAddress] = useState([]);
    const handleOpen1 = () => setOpen1(true);
    const handleOpen2 = () => setOpen2(true);
    const handleClose = () => {
        setOpen1(false);
        setOpen2(false);
    };

    useEffect(() => {
        connectWalletHandler();
        setAucID(JSON.parse(window.localStorage.getItem('aucID')));
        setState(JSON.parse(window.localStorage.getItem('state')));
    }, []);

    useEffect(() => {
        window.localStorage.setItem('aucID', aucID);
    }, [aucID]);

    useEffect(() => {
        window.localStorage.setItem('state', state);
    }, [state]);


    useEffect(() => {
        setState(0);
    }, [address]);


    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

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

    const callbackState = (data) => {
        setState(data);
    }

    const callbackStateAucID = (data) => {
        setAucID(data);
    }

    const stopAuction = async () => {
        try {
            await contract.methods.closeAuction(aucID).send({
                from: address
            })
            setState(2);
        } catch (error) {
            setError(error.message)
        }
    }

    const endReveal = async () => {
        try {
            await contract.methods.endReveal(aucID).send({
                from: address
            })
            const resultWinner = await contract.methods.getContractWinner(aucID).call()
            setWinnerAddress(resultWinner);
            handleOpen2()
            setState(3);
        } catch (error) {
            setError(error.message)
        }
    }

    const reset = async () => {
        setState(0);
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
                                        {address ? <span className="tag is-link is-medium"> Adresa: {address} </span> : null}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="hero-body">
                    <div className="container has-text-centered">
                        <button onClick={handleOpen1} className='button is-large is-primary' disabled={state == 0 ? false : true}>Solicita Energie</button> <br />
                        <Modal
                            open={open1}
                            onClose={handleClose}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                            display={false}
                        >
                            <Box sx={style}>
                                <SignUp contract={contract} address={address} state={callbackState} error={setError} web3={web3} aucId={callbackStateAucID} />
                            </Box>
                        </Modal>
                        <button onClick={stopAuction} className='button is-large is-primary m-4' disabled={state == 1 ? false : true}>Opreste licitatia criptata</button><br />
                        <button onClick={endReveal} className='button is-large is-primary' disabled={state == 2 ? false : true}>Opreste licitatia</button><br />
                        <Modal
                            open={open2}
                            onClose={handleClose}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                            display={false}
                        >
                            <Box sx={{ ...style, width: 800 }}>
                                <Winner address={address} contract={contract} aucId={aucID} winnerAddress={winnerAddress[0]} winnerPrice={winnerAddress[1]} />
                            </Box>
                        </Modal>
                        <button onClick={reset} className='button is-large is-primary mt-4' disabled={state == 3 ? false : true}>Cerere Noua</button><br />
                        <Link href="/first-page">
                            <div className='container'>
                                <button className='button is-large is-primary mt-4'>Inapoi</button> <br />
                            </div>
                        </Link>
                    </div>
                </div>

            </section>
        </div >
    )
}

export default EV