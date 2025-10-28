const sendOTPEmail = (OTP, email) => {
    const sgMail = require('@sendgrid/mail')

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to: `${email}`,                        // recipient email
        from: 'bhargavpanchal9099@gmail.com', //  verified sender
        subject: 'OTP for Reset Password request',
        text: `Your OTP for reset password for ${email} is ${OTP}`,
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
}

module.exports = {
    sendOTPEmail
}