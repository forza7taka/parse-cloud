Parse.Cloud.define("GoogleSignIn", async (request) => {
    const dotenv = require('dotenv')
    dotenv.config()

    const { google } = require('googleapis')
    if (!process.env.GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET ||
        !process.env.GOOGLE_REDIRECT_URI) {
        return
    }
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        )
        const scopes = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'];
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        })
        return url
    } catch (e) {
        throw e
    }
});

Parse.Cloud.define("GoogleGetProfile", async (request) => {
    const dotenv = require('dotenv')
    dotenv.config()
    if (!process.env.GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET ||
        !process.env.GOOGLE_REDIRECT_URI) {
        return
    }

    let res
    try {
        const { google } = require('googleapis')
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        )
        const { tokens } = await oauth2Client.getToken(request.params.code)
        const accessToken = tokens.access_token

        oauth2Client.setCredentials({ access_token: accessToken })

        const people = google.people({ version: 'v1', auth: oauth2Client })
        res = await people.people.get({
            resourceName: 'people/me',
            personFields: 'names,emailAddresses'
        })
    } catch (e) {
        throw e
    }
    return res.data
});