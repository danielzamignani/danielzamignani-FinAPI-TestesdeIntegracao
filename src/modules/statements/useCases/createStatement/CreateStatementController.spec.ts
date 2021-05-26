import request  from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection

describe("Create Statement controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  });

  it("Should be able to make a deposit", async () => {
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
    .post("/api/v1/statements/deposit")
    .send({
      description: "Deposit test",
      amount: 50
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.body).toHaveProperty("description");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("type")
    expect(response.status).toBe(201);

  });

  it("Should be able to make a withdraw", async () => {
    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@test.com.br",
      password: "123456"
    });

    const { token }= responseToken.body

    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
      description: "Withdraw test",
      amount: 30
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.body).toHaveProperty("description");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.status).toBe(201);
  });

  it("Should not be able to make a statement with an inexistent user", async () => {
    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "INCORRECT_PASSWORD",
      password: "123456"
    });

    const { token }= responseToken.body

    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
      description: "Withdraw test",
      amount: 30
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(401)
  });

  it("Should not be able to make a withdraw with insufficient founds", async () => {
    await request(app)
    .post("/api/v1/users")
    .send({
      name: "Test2",
      email:"test2@test.com.br",
      password: "123456"
    });

    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test2@test.com.br",
      password: "123456"
    });

    const { token }= responseToken.body

    const response = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
      description: "withdraw error test",
      amount: 50
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(400);
  });
});
