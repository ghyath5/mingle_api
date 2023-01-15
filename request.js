const { default: axios } = require("axios");
const crypto = require('crypto');
module.exports.BASE_URL = 'https://api.mingle2.com';
module.exports.connector = 'b293618115e009b977e626dfc1e84af4388837fc7ee15028ae3a10f9b63c2d9c2e703367aed85ab97cbc604533f888a10acd3b59dd7767aef35b7e15f97c4c2b';
module.exports.separatorAction = 'b88a02188bdb8e839a26dfaf0b77450538c727fbcd36e5378415d4a7fd3d20d1'
module.exports.DEFAULT_HEADERS = {
    'user-agent': 'Mingle2 / 9.0.1(AndroidPhone; Android 7.1.2; Asus; ASUS_Z01QD; normal; en)',
    'x-uid': '71192492',
    'content-type': 'application/json'
}
module.exports.DEFAULT_DATA = {
    "auth_token": "b88a02188bdb8e839a26dfaf0b77450538c727fbcd36e5378415d4a7fd3d20d1",
    "registration_id": "fKhHgHedSiqLjl9SL7CaqO:APA91bHPgkgP-JGxF-5x6jTZCM13d3IPV0x5ovGlaYInbz5eS6AQFv--YfeXElwgciob3uKDHAVrL14ZKyJkFFQzBYnnWO9nSdzjefB1uGuXbN_7SXrtPUhbTvl5fd9J-dj--vhLlUT2",
    "session_identifier": "2f3c2317-a922-431d-88d5-2e8165c4a0e8",
    "user_id": "71192492"
}
module.exports.sleep = async (miliseconds) => {
    return await new Promise((r) => setTimeout(r, miliseconds))
}
module.exports.request = async (endpoint, { method = 'get', data = {}, actionToken = '', headers = {} }) => {
    try {
        headers = {
            ...this.DEFAULT_HEADERS,
            'action-token': actionToken,
            ...headers,
        }
        data = { ...this.DEFAULT_DATA, ...data, }
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

module.exports.generateActionToken = (endpoint, entries) => {
    let key = this.connector + endpoint;
    for (const entry of entries) {
        let str = key + entry
        key = str;
    }
    return crypto.createHash('sha256').update(key).digest('hex');
}



module.exports.rate = async (id) => {
    const res = await this.request('/api/v2/mutual_match/rate_only', {
        method: 'post',
        data: {
            "match_user_id": id,
            "rating": "Y",
        }
    })
    console.log(res);
}

module.exports.whos_online = async (page = 1) => {
    console.log('Online users page: ', page);
    const endpoint = '/api/search/whos_online'
    const actionToken = this.generateActionToken(endpoint, [this.separatorAction, page])
    const res = await this.request(endpoint, {
        method: 'post',
        data: {
            "page": page,
        },
        actionToken
    })
    const onlineUsers = res.search.map(u => u.user)
    return onlineUsers;
}

module.exports.who_is_interested_in_me = async (page = 1) => {
    console.log('interested in me users page: ', page);
    const endpoint = '/api/v3/mutual_match/who_is_interested_in_me'
    const actionToken = this.generateActionToken(endpoint, [this.separatorAction, page])
    const res = await this.request(endpoint, {
        method: 'post',
        data: {
            "page": page,
        },
        actionToken
    })
    const interestedInMeUsersIDs = res.mutual_match.map(u => u.id)
    return interestedInMeUsersIDs;
}

module.exports.rate_online_users = async (startPage = 1) => {
    const onlineUsers = await this.whos_online(startPage)
    for (const onlineUser of onlineUsers) {
        await this.rate(onlineUser.id)
        await this.sleep(Math.random() * 1300 + 1000)
    }
    if (startPage <= 5) {
        return this.rate_online_users(startPage += 1)
    }
}

module.exports.rate_interested_in_me_users = async () => {
    const interestedInMeUsersIDs = await this.who_is_interested_in_me(1)
    console.log(interestedInMeUsersIDs);
    // for (const onlineUser of onlineUsers) {
    //     await this.rate(onlineUser.id)
    //     await this.sleep(Math.random() * 1300 + 1000)
    // }
}
