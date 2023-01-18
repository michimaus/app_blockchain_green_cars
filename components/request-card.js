import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

export default function BasicCard(props) {

    const handleSubmit1 = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const offer = data.get('offerSealed')
        sealedOffer(offer)
    };

    const sealedOffer = async (offer) => {
        try {
            console.log(offer)
            await props.contract.methods.makeSealedOffer(props.aucId, props.web3.utils.soliditySha3(offer)).send({
                from: props.address
            })
            props.setState(1)
        } catch (error) {
            props.setError(error.message)
        }
    }

    const handleSubmit2 = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const offer = data.get('offer')
        arata(offer)
    };

    const arata = async (offer) => {
        try {
            await props.contract.methods.revealOffer(props.aucId, offer).send({
                from: props.address
            })
            props.setState(2);
        } catch (error) {
            props.setError(error.message)
        }
    }

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

    const sealedOfferComp = (<ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Detalii oferta criptata
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit1} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                name="offerSealed"
                                required
                                fullWidth
                                id="offerSealed"
                                label="Oferta"
                                autoFocus
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Trimite Oferta Criptata
                    </Button>
                </Box>
            </Box>
        </Container>
    </ThemeProvider>)

    const offerComp = (<ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Detalii oferta
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit2} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                name="offer"
                                required
                                fullWidth
                                id="offer"
                                label="Oferta"
                                autoFocus
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Trimite Oferta
                    </Button>
                </Box>
            </Box>
        </Container>
    </ThemeProvider>)

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={6}>

                        <Typography align='left'>
                            Adresa cumparatorului: <span className="tag is-danger is-medium"> {props.buyer} </span>
                        </Typography>

                        <Typography align='left'>
                            Cantitatea de energie: <span className="tag is-danger is-medium m-4">{props.amount} kW</span>
                        </Typography>
                        <Typography align='left'>
                            Pretul maxim: <span className="tag is-danger is-medium"> {props.price} ETH </span>
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <button onClick={props.handleOpen1} className='button is-large is-primary' disabled={props.state == 0 ? false : true}>Oferta Criptata</button> <br />
                        <Modal
                            open={props.open1}
                            onClose={props.handleClose}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                            display={false}
                        >
                            <Box sx={style}>
                                {sealedOfferComp}
                            </Box>
                        </Modal>
                        <button onClick={props.handleOpen2} className='button is-large is-primary m-4' disabled={props.state == 1 ? false : true}>Oferta</button> <br />
                        <Modal
                            open={props.open2}
                            onClose={props.handleClose}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                            display={false}
                        >
                            <Box sx={style}>
                                {offerComp}
                            </Box>
                        </Modal>
                    </Grid>
                    <Grid item xs={4}>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
