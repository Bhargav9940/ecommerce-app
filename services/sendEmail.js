const sendOTPEmail = (OTP, email) => {
    const sgMail = require('@sendgrid/mail')

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to: `${email}`, // Change to your recipient
        from: 'bhargavpanchal9099@gmail.com', // Change to your verified sender
        subject: 'OTP for Reset Password request',
        text: `Your OTP for reset password for ${email} is ${OTP}`,
        // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
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