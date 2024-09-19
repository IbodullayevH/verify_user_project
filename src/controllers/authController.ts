import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from 'errors';
import { createClient } from "redis"
import { Auth } from 'utils';
import { PrismaClient } from '@prisma/client';
let prismaClient = new PrismaClient()

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);


let redisClient = createClient()

redisClient.on("error", () => {
    console.log("err");
})

redisClient.connect().catch((err) => {
    console.log(`redis connected: ${err}`);

})

export class AuthController {
    static async SendCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { fullname, email, password, username } = req.body;
            const code = Math.floor(Math.random() * 1000000);

            let existUser = await prismaClient.users.findFirst({
                where: {
                    email: email
                }
            })

            if (existUser) {
                return res.status(409).send({
                    success: false,
                    message: "already exist user"
                })
            }
            redisClient.setEx(email, 60, JSON.stringify(code))

            // Email yuborish
            const msg = {
                to: email,
                from: 'h7502326@gmail.com',
                subject: 'Tasdiqlash kodi',
                html: `<b>Sizning tasdiqlash kodingiz: ${code}</b>`,
            };


            await sgMail.send(msg);
            let newUser = await prismaClient.users.create({
                data: {
                    fullname,
                    email,
                    password,
                    username,
                }
            })

            res.status(200).send({
                success: true,
                message: "Tasdiqlash kodi muvaffaqiyatli yuborildi",
                data: newUser,
            });
        } catch (error: any) {
            next(new ErrorHandler(error.message, error.status || 500));
        }
    }


    // verify
    static async VerifyCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, code } = req.body;

            let redisCode = await redisClient.get(email)
            let token = Auth.signMtd({ email })


            if (redisCode && JSON.parse(redisCode) === parseInt(code, 10)) {
                res.status(200).send({
                    success: true,
                    message: "Verifed successfully",
                    token: token
                });
            } else {
                res.status(400).send({
                    success: false,
                    message: "Tasdiqlash kodi xato yoki muddati o'ztgan",
                });
            }

        } catch (error: any) {
            next(new ErrorHandler(error.message, error.status || 500));
        }
    }

}
