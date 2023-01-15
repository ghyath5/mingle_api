const { vote_whos_online } = require("./mingle/request")
const { rate_online_users, whos_online, rate_interested_in_me_users } = require("./request")
const { default: axios } = require("axios");
var cron = require('node-cron');
const express = require('express')
const app = express()
cron.schedule('*/6 * * * *', async () => {
    console.log('running a task every minute');
    axios.get('https://yeetalk.herokuapp.com/').then(() => { }).catch(() => { })
    try {
        await rate_online_users(1)
    } catch (e) {
        console.log(e);
    }
    try {
        await vote_whos_online(1)
    } catch (e) {
        console.log(e);
    }
});
app.get('/', (rq, rs) => {
    rs.send("refreshed")
})
app.listen(process.env.PORT, () => {
    console.log('Running on port:', process.env.PORT);
})
// whos_online(1).then(console.log)
// rate_interested_in_me_users()