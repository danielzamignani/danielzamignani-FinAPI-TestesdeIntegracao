import request  from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection

describe("Get balance controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  });

  it("Should be able to get a balance of an user account", async () => {
    await request(app)
    .post("/api/v1/users")
    .send({
      name: "Test",
      email:"test@test.com.br",
      password: "123456"
    });

    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@test.com.br",
      password: "123456"
    });

    const { token }= responseToken.body

    const response = await request(app)
    .get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.body).toHaveProperty("balance");
    expect(response.body).toHaveProperty("statement");
    expect(response.status).toBe(200);

  });

  it("Should not be able to get balance with an inexistent user", async () => {
    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "INCORRECT_USER",
      password: "123456"
    });

    const { token }= responseToken.body

    const response = await request(app)
    .get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(401)
  })
});
