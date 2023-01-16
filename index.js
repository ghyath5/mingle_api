const { vote_whos_online, new_members, vote_new_members } = require("./mingle/request")
const { rate_online_users, whos_online, rate_interested_in_me_users, rate, mutual_match_users, rate_users } = require("./request")
const { default: axios } = require("axios");
var cron = require('node-cron');
const express = require('express')
const app = express()
cron.schedule('* * * * *', async () => {
    try {
        await rate_users()
    } catch (e) {
        console.log(e);
    }
});
cron.schedule('*/4 * * * *', async () => {
    axios.get('https://mingle-api2.herokuapp.com/').then(() => { }).catch(() => { })
    try {
        // await vote_new_members()
    } catch (e) {
        console.log(e);
    }
});
app.get('/', (rq, rs) => {
    rs.send("refreshed")
})
app.get('/like-online', (rq, rs) => {
    vote_whos_online(1)
    rate_online_users(1)
    rs.json({ status: "DONE" })
})
app.listen(process.env.PORT, () => {
    console.log('Running on port:', process.env.PORT);
})
// whos_online(1).then(console.log)
// rate_interested_in_me_users()