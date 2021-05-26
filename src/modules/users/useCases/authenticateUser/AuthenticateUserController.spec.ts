import request  from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection

describe("Authenticate user controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  });

  it("Should be able to authenticate an user", async () => {
    await request(app)
    .post("/api/v1/users")
    .send({
      name: "Test",
      email:"test@test.com.br",
      password: "123456"
    });

    const response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@test.com.br",
      password: "123456"
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("id");
    expect(response.body).toHaveProperty("token");

  });

  it("Should not be able to authenticate with incorrect password", async () => {
    const response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@test.com.br",
      password: "INCORRETPASSWORD"
    });

    expect(response.status).toBe(401);

  })
});
