import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

const EMAIL_TOKEN_EXPIRATION_TIME = 10;
const API_TOKEN_EXPIRATION_TIME = 100;
const JWT_SECRET = process.env.JWT_SECRET || "SUPER SECRET";

const generateEmailToken = (): string => {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

const generateAuthToken = (tokenId: number): string => {
  const jwtPayload = { tokenId };
  return jwt.sign(jwtPayload, JWT_SECRET, {
    algorithm: "HS256",
    noTimestamp: true,
  });
};

//end points

// "/auth/login"
router.post("/login", async (req, res) => {
  const { email } = req.body;

  //generate token
  const emailToken = generateEmailToken();
  const expiration = new Date(
    new Date().getTime() + EMAIL_TOKEN_EXPIRATION_TIME * 60 * 1000
  );

  try {
    const createtoken = await prisma.token.create({
      data: {
        type: "EMAIL",
        emailToken,
        expiration,
        user: {
          connectOrCreate: {
            where: { email },
            create: { email },
          },
        },
      },
    });

    console.log(createtoken);
    res.sendStatus(200);
  } catch (error) {
    res.json(error);
  }
});

//validate the emailtoken
//generate a JWT token
router.post("/authenticate", async (req, res) => {
  const { email, emailToken } = req.body;
  const dbEmailToken = await prisma.token.findUnique({
    where: {
      emailToken,
    },
    include: {
      user: true,
    },
  });

  console.log(dbEmailToken);

  if (!dbEmailToken || !dbEmailToken.valid) {
    return res.sendStatus(401);
  }

  if (dbEmailToken.expiration < new Date()) {
    return res.sendStatus(401).json({ error: "token expire..." });
  }

  if (dbEmailToken?.user?.email !== email) {
    return res.sendStatus(401).json({ error: "email not matched..." });
  }

  // generate API token
  const expiration = new Date(
    new Date().getTime() + API_TOKEN_EXPIRATION_TIME * 60 * 60 * 1000
  );
  const apiToken = await prisma.token.create({
    data: {
      type: "API",
      expiration,
      user: {
        connect: {
          email,
        },
      },
    },
  });

  // Invalidate the email
  await prisma.token.update({
    where: { id: dbEmailToken.id },
    data: { valid: false },
  });

  // generate JWT token
  const authToken = generateAuthToken(apiToken.id);

  res.json({ authToken });
});

export default router;
