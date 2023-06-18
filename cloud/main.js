Parse.Cloud.define("GoogleSignIn", async (request) => {
    const dotenv = require('dotenv')
    dotenv.config()

    const { google } = require('googleapis')
    if (!process.env.GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET ||
        !process.env.GOOGLE_REDIRECT_URI) {
        return
    }
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    )
    const scopes = ['openid', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    })
    return url
});

Parse.Cloud.define("GoogleGetID", async (request) => {
    const dotenv = require('dotenv')
    dotenv.config()
    if (!process.env.GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET ||
        !process.env.GOOGLE_REDIRECT_URI) {
        return
    }

    const { google } = require('googleapis')
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    )
    const { tokens } = await oauth2Client.getToken(request.params.code)
    oauth2Client.setCredentials({ access_token: tokens.access_token })

    const api = google.people({ version: 'v1', auth: oauth2Client })
    const people = await api.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses'
    })
    return {
        access_token: tokens.access_token,
        id_token: tokens.id_token,
        id: people.data.emailAddresses[0].metadata.source.id
    }
});
