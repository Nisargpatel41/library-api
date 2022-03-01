const express = require("express");
const config = require("config");
const Joi = require("joi");
const nodemailer = require("nodemailer");

const { User } = require("../models/user");

const router = express.Router();

router.get("/", (req, res) => {
  User.find({ isDeleted: false })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(503).send("something failed");
    });
});

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = new User({
    userName: req.body.userName,
    userEmail: req.body.userEmail,
    userPhone: req.body.userPhone,
    createdAt: req.body.createdAt,
  });

  const result = await user.save();

  const updatedUserName = result.userName;
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "nhp264@gmail.com", // generated ethereal user
      // pass: "", // generated ethereal password
      pass: "dmtadaamziarzlhe",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  if (result.userEmail && result.userEmail !== "") {
    // sending email to user
    new Promise((resolve, reject) => {
      let mailOptions = {
        from: `"Readers Paradise" <${"nhp264@gmail.com"}>`, // sender address
        to: result.userEmail, // list of receivers
        subject: `Hi ${updatedUserName}`, // Subject line
        // text: "", // plain text body
        html: `
      <div style="text-align:left;">
      
        <h4>Thank you for filling out your information!
          <br> It really means a lot to us 😊
        </h4>
  
        <p style="font-size:1.2em;">We've received your details and our team will contact you soon. If your inquiry is urgent, please use the mobile number +918780052305 to talk to us.</p>
      </div>    
      `, // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
          reject(err.message);
        }
        // console.log("Message sent: %s", info);
        resolve(info);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      });
    });
  }

  // sending email to team
  new Promise((resolve, reject) => {
    const receivers = ["nhp0640@gmail.com", "parshvshah5364@gmail.com"];

    receivers.forEach((reciever) => {
      let mailOptions = {
        from: `"Readers Paradise" <${"nhp264@gmail.com"}>`, // sender address
        to: reciever, // list of receivers
        subject: `New Student Request`, // Subject line
        // text: "", // plain text body
        html: `
        <div style="text-align:left;">
        
          <h4>Student information</h4>
          <table>
            <tr>
                  <td>Name: </td>
                  <td>${result.userName}</td>
            </tr>
            <tr>
                  <td>Phone: </td>
                  <td>${result.userPhone}</td>
            </tr>
            ${
              result.userEmail &&
              `<tr>
                  <td>Email: </td>
                  <td>${result.userEmail}</td>
                </tr>`
            }
          </table>    
        </div>    
        `, // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
          reject(err.message);
        }
        // console.log("Message sent: %s", info);
        resolve(info);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      });
    });
  });

  return res.status(200).send(result);
});

router.put("/:msgId", (req, res) => {
  const messageId = req.params.msgId;
  const time = req.body.time;

  User.findOneAndUpdate(
    { _id: messageId },
    { isDeleted: true, updatedTime: time }
  )
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send(err);
      // console.log(err);
    });
});

function validateUser(user) {
  const schema = {
    userName: Joi.string()
      .trim()
      .regex(/^[A-Za-z ]+$/)
      .required()
      .error(() => {
        return {
          message: "Username is missing",
        };
      }),
    userEmail: Joi.string()
      .trim()
      .email()
      .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .error(() => {
        return {
          message: "email is invalid",
        };
      }),
    userPhone: Joi.string()
      .trim()
      .regex(/^[6-9]\d{9}$/)
      .required()
      .min(10)
      .max(10)
      .error(() => {
        return {
          message: "phone number is invalid",
        };
      }),
    createdAt: Joi.string()
      .trim()
      .error(() => {
        return { message: "invalid created date" };
      }),
  };

  return Joi.validate(user, schema);
}

module.exports = router;
