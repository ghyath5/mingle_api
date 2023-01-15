const { default: axios } = require("axios");
const crypto = require('crypto');
module.exports.BASE_URL = 'https://api.justsayhi.com';
module.exports.connector = '1c102c638d64ff476c3fb5aa992c1f4b';
module.exports.deviceID = '1673798010254-cfec1e9e75803fce'
module.exports.DEFAULT_HEADERS = {
    'user-agent': 'Mingle2 / 9.0.1(AndroidPhone; Android 7.1.2; Asus; ASUS_Z01QD; normal; en)',
    'content-type': 'application/json',
    'x-uid': '64178962',
    'auth-token': 'cfbd8d9c7d805c229aedaa69471b405d'
}
module.exports.DEFAULT_DATA = {
    "app_name": "mingle",
    "device_id": "1673798010254-cfec1e9e75803fce",
    "device_type": "android_phone",
    "idfa": "7f170be8-ef61-4a7c-8d39-08a7a58f0278",
    "is_ads_tracking_enabled": true,
    "language_preference": "en"
}
module.exports.sleep = async (miliseconds) => {
    return await new Promise((r) => setTimeout(r, miliseconds))
}
module.exports.request = async (endpoint, { method = 'get', data = {}, actionToken = '', headers = {} }) => {
    headers = {
        ...this.DEFAULT_HEADERS,
        'action-token': actionToken,
        ...headers,
    }
    data = { ...this.DEFAULT_DATA, ...data, }
    try {
        let response = await axios[method](
            `${this.BASE_URL}${endpoint}`,
            method == 'post' ? ({ ...data }) : {
                headers,
                data
            },
            method == 'post' && ({
                headers
            })

        )
        return response.data;
    } catch {
        return {}
    }
}

module.exports.generateActionToken = (endpoint, entries = []) => {
    let key = this.deviceID + this.connector + 'api' + endpoint;
    for (const entry of entries) {
        let str = key + entry
        key = str;
    }
    return crypto.createHash('sha256').update(key).digest('hex');
}



module.exports.whos_online = async (page = 1) => {
    console.log('whos online page:', page);
    const endpoint = '/v5/whos_online'
    const actionToken = this.generateActionToken(endpoint, [page])
    const users = await this.request(endpoint, {
        method: 'get',
        data: {
            page,
            interaction_info: true

        },
        actionToken
    })
    return users
}
module.exports.new_members = async () => {
    const endpoint = '/v5/new_members'
    const actionToken = this.generateActionToken(endpoint, [])
    console.log(actionToken);
    const res = await this.request(endpoint, {
        method: 'get',
        actionToken
    })
    return res.map(user => user.id)
}
module.exports.vote = async (id) => {
    const endpoint = `/v5/public_users/${id}/vote`
    const actionToken = this.generateActionToken(endpoint, [])
    console.log(id);
    const res = await this.request(endpoint, {
        method: 'post',
        actionToken
    })
    console.log(res);
}
module.exports.vote_new_members = async () => {
    const newMembersIDs = await this.new_members()
    for (const memberID of newMembersIDs) {
        await this.vote(memberID)
        await this.sleep(Math.random() * 1300 + 1000)
    }
}
module.exports.vote_whos_online = async (startPage = 1) => {
    const onlineUsersMeta = await this.whos_online(startPage)
    const notLikedUsers = onlineUsersMeta.search_result.filter((user) => !user.interaction_info.liked)
    const meta = onlineUsersMeta.meta
    for (const user of notLikedUsers) {
        await this.vote(user.id)
        await this.sleep(Math.random() * 1300 + 1000)
    }
    // if (meta.page_size && meta.total_pages && (startPage * Number(meta.page_size) < Number(meta.total_pages))) {
    //     return this.vote_whos_online(startPage += 1)
    // }
    if (startPage <= 8) {
        return this.vote_whos_online(startPage += 1)
    }
}

