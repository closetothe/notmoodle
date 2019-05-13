/* Jamiel Rahi
 * notmoodle
 * GPL 2019
 *
 * Mailing utilities.
 */

'use strict';

const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
	service: 'gmail',
	secure: true,
	auth: {
			user: "mail.notmoodle@gmail.com",
			pass: process.env.MAILPASS
	},
	tls: {
		rejectUnauthorized: false
	}
});

// Optional email notification option for people who post
module.exports.replyNotify = function(recipient, post, reply, who){
			
	let helperOptions = {
							from: '"Not Moodle" <mail.notmoodle@gmail.com>',
							to: [recipient],
							subject: "Someone replied",
							html:  `
							<h2>Someone replied to <a href=${post}>your post</a>:</h2>
							<br>
							<p><strong>Name:</strong> ${who}</p> 
							<p><strong>Message:</strong></p> 
							${reply}
												`
						};
	transporter.sendMail(helperOptions, (error, info) => {
							if(error) {console.log(error)}
							else {
							    console.log("------------------------------");
								console.log("SENT MAIL to " + recipient);
								console.log(info);
								console.log("------------------------------");

							}
						});
};
	
// Used for me to see when people post
module.exports.postNotify = function(permalink, contents, who, email){
			
	let helperOptions = {
							from: '"Not Moodle" <mail.notmoodle@gmail.com>',
							to: ["mail.notmoodle@gmail.com"],
							subject: "Someone posted",
							html:  `
							<h2>Someone <a href=${permalink}>posted</a></h2>
							<br>
							<p><strong>Name:</strong> ${who}</p> 
							<p><strong>Email:</strong> ${email}</p>
							<p><strong>Message: </strong></p>
							<div style="color: grey"> 
							${contents}
							</div>
												`
						};
	transporter.sendMail(helperOptions, (error, info) => {
							if(error) {console.log(error)}
							else {
							    console.log("------------------------------");
								console.log("SENT post-notify");
								console.log(info);
								console.log("------------------------------");

							}
						});
};
			





