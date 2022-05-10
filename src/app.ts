import express, { Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import mongoose from "mongoose";

import postsRouter from "./routes/posts";
import authRouter from "./routes/auth";
import HttpError from "./models/HttpError";

const app = express();

const port = process.env.PORT || 5000;

app.use(json());

app.use("/app/v1/posts", postsRouter);
app.use("/app/v1/auth", authRouter);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.code || 500).json({
    error: {
      message: err.message || "Server is busy at the moment !",
      statusCode: err.code || 500,
      requestStatus: "Fail",
    },
  });
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

mongoose
  .connect(
    `mongodb+srv://chakri:chakri@cluster0.pkkrb.mongodb.net/memories?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`Server started at port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
