const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL;

const get_user_profile = async (user_token) => {

    var data = '';

    var config = {
        method: 'get',
        url: `${BASE_URL}/UsersV2/GET_Profile?token=${user_token}`,
        headers: {},
        data: data
    };

    try {
        let response = await axios(config);
        let status = response.data.StatusCode;
        if (status == 1) {
            return {
                status: 1,
                user_profile: response.data
            };
        } else {
            return {
                status: 0,
                user_profile: {}
            };
        }
    } catch (error) {
        console.error(`Error at get_user_profile -> ${error}`);
        return {
            status: 0,
            user_profile: {}
        };
    }
};

const set_user_metadata = async (metadata, user_token) => {
    let data = JSON.stringify(metadata);

    let config = {
        method: 'post',
        url: `${BASE_URL}/UserMetadataV2/SET_List?Token=${user_token}`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        let response = await axios(config);
        let status = response.data.StatusCode;
        if (status == 1) {
            return {
                status: 1
            };
        } else {
            return {
                starus: 0
            };
        }
    } catch (error) {
        console.error(`Error at set_user_metadata -> ${error}`);
        return {
            starus: 0
        };
    }
};
const set_list_dailyreport = async (metadata1, user_token) => {
    let data = JSON.stringify(metadata1);

    let config = {
        method: 'post',
        url: `${BASE_URL}/DailyProgressV2/SET_List?Token=${user_token}`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        let response = await axios(config);
        let status = response.data.StatusCode;
        if (status == 1) {
            return {
                status: 1
            };
        } else {
            return {
                starus: 0
            };
        }
    } catch (error) {
        console.error(`Error at set_list_dailyreport -> ${error}`);
        return {
            starus: 0
        };
    }
};

module.exports = {
    get_user_profile,
    set_user_metadata,
    set_list_dailyreport
};

