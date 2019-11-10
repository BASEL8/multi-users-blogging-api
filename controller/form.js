const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.contactForm = (req, res) => {
  const { email, name, message } = req.body
  const emailData = {
    to: process.env.EMAIL_TO,
    from: email,
    subject: `contact from ${process.env.APP_NAME}`,
    text: `email received from contact from \n sender name : ${name} \n sender email : ${email} \n sender message : ${message}`,
    html: `
    <h4>email received from contact from<h4> 
    <p>sender email : ${email}</p>
    <p>sender name : ${name}</p>
    <p>sender message : ${message}</p>
    `
  }
  sgMail.send(emailData).then(sent => {
    return res.json({
      success: true
    })
  })
}


exports.contactBlogAuthorForm = (req, res) => {
  console.log(req.body)
  const { authorEmail, email, name, message } = req.body
  let mailList = [authorEmail, process.env.EMAIL_TO]
  const emailData = {
    to: mailList,
    from: email,
    subject: `someone messaged you from ${process.env.APP_NAME}`,
    text: `email received from contact from \n sender name : ${name} \n sender email : ${email} \n sender message : ${message}`,
    html: `
    <h4>email received from contact from<h4> 
    <p>email : ${email}</p>
    <p>name : ${name}</p>
    <p>message : ${message}</p>
    `
  }
  sgMail.send(emailData).then(sent => {
    return res.json({
      success: true
    })
  })
}