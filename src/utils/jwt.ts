import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey: string = process.env.SECRET_KEY as string;

if (!secretKey) {
    throw new Error('SECRET_KEY is not defined in the environment variables');
}

export class Auth {
    // sign
    static signMtd(payload: object): string {
        try {
            const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
            return token;
        } catch (error: any) {

            throw new Error(`Error signing token: ${error.message}`);
        }
    }
}
