const request = require("supertest");
const app = require("./index.js");

describe("POST /detail", () => {
  test("it should return a 400 error for missing date", () => {
    return request(app)
      .post("/detail")
      .send({})
      .expect(400, { error: "Date is required." });
  });
});
