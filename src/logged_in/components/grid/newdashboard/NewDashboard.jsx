import { React, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { getTickers } from '../../../../shared/functions/requests.js';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Avatar from '@material-ui/core/Avatar';


const useStyles = makeStyles((theme) => ({
    root: {
        width: '13em',
        height: '6.5em',
        cursor: 'pointer',
        margin: '5px'
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        whiteSpace: 'nowrap',
        fontSize: 14,
        textOverflow: 'ellipsis',
        overflow: 'hidden'
    },
    pos: {
        marginBottom: 12,
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    filter: {
        margin: '5px',
        marginBottom: '25px',
    },
    formControl: {
        marginLeft: '15px',
        minWidth: 150,
    },
    formItem: {
        display: 'flex',
    },
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(1)
    },
}));
function TickerCard(props) {
    const classes = useStyles();
    let el = props.ticker
    return (
        <Card className={classes.root} onClick={() => props.chooseIdentifier(el.ticker)}>
            <CardContent>
                <Typography className={classes.title} color="textSecondary" gutterBottom>
                    {el.description}
                </Typography>
                <Typography variant="h5" component="h2">
                    {el.ticker}
                </Typography>
            </CardContent>
        </Card>
    );
}
export default function NewDashboard(props) {
    const classes = useStyles();
    const [tickers, setTickers] = useState(undefined)
    const [exchange, setExchange] = useState('US')

    useEffect(() => {
        getTickers(0, 'AP', 'US')
            .then(res => {
                setTickers(res)
            })
    }, [])

    const filter = (e) => {
        getTickers(0, e.target.value, exchange)
            .then(res => {
                setTickers(res)
            })
    }
    const handleChange = (e) => {
        setExchange(e.target.value)
        getTickers(0, e.target.value, e.target.value)
            .then(res => {
                setTickers(res)
            })
    }

    const imgUrl = `${process.env.PUBLIC_URL}/images/flags/`
    if (tickers) {
        return (
            <>
                <div className={classes.filter}>
                    <TextField id="standard-basic" label="Search" onChange={filter} />
                    <FormControl className={classes.formControl}>
                        <InputLabel id="demo-simple-select-label">Exchange</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={exchange}
                            onChange={handleChange}

                        >
                            <MenuItem value={'SA'} >
                                <span className={classes.formItem}>
                                    <Avatar alt="Remy Sharp" src={imgUrl + 'br.png'} className={classes.small} /> Brazil
                                </span>
                            </MenuItem>
                            <MenuItem value={'US'}>
                                <span className={classes.formItem}>
                                    <Avatar alt="Remy Sharp" src={imgUrl + 'us.png'} className={classes.small} /> US
                                </span>
                            </MenuItem>
                            <MenuItem value={'PA'}>
                                <span className={classes.formItem}>
                                    <Avatar alt="Remy Sharp" src={imgUrl + 'fr.png'} className={classes.small} /> France
                                </span>
                            </MenuItem>
                            <MenuItem value={'F'}>
                                <span className={classes.formItem}>
                                    <Avatar alt="Remy Sharp" src={imgUrl + 'de.png'} className={classes.small} /> Germany
                                </span>
                            </MenuItem>

                        </Select>
                    </FormControl>
                </div>
                <div className={classes.wrapper}>
                    {tickers.map(t => {
                        return (
                            <>

                                <TickerCard ticker={t} {...props} />
                            </>
                        )
                    })}
                </div>
            </>
        )
    } else {
        return null
    }
}