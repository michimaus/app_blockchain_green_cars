import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

export default function SignUp(props) {
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const amount = data.get('amount');
        const price = data.get('price')
        requestEnergy(amount, price)
    };

    const requestEnergy = async (amount, price) => {
        try {
            const recepeit = await props.contract.methods.createReq(amount, price, 0, 0, 0).send({
                from: props.address
            })
            const aucID = recepeit['events']['LogReqCreated']['returnValues']['_aucId'];
            props.aucId(aucID);
            props.state(1);
        } catch (error) {
            props.error(error.message);
        }
    }

    return (
        <ThemeProvider theme={theme}>
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
                        Detalii cerere
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    name="amount"
                                    required
                                    fullWidth
                                    id="amount"
                                    label="Energie necesara"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="price"
                                    label="Pretul maxim acceptat"
                                    name="price"
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Trimite Cerere
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}