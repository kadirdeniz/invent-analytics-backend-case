import request from "supertest";
import express from "express";
import { healthRouter } from "../healthRouter";

// Mock container ve database bağımlılıklarını kaldıralım
jest.mock("../../config/container", () => ({
  container: {
    resolve: jest.fn(),
  },
}));

describe("Health Check", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use("/health", healthRouter);
  });

  it("should return 200 and ok status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      timestamp: expect.any(String),
    });
  });
});
