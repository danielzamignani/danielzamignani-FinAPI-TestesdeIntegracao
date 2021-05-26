import request  from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection

describe("Get statement operation controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  });

  it("Should be able to get statement operation", async () => {
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

    const responseStatement = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      description: "Deposit test",
      amount: 50
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    const { id } = responseStatement.body

    const response = await request(app)
    .get(`/api/v1/statements/${id}`)
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.body).toHaveProperty("description");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("type")
    expect(response.status).toBe(200);
  });

  it("Should not be able to get statement with an inexistent user", async () => {
    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "INCORRECT_USER",
      password: "123456"
    });

    const { token }= responseToken.body

    const responseStatement = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      description: "Deposit test",
      amount: 50
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    const { id } = responseStatement.body

    const response = await request(app)
    .get(`/api/v1/statements/${id}`)
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(401);
  });

  it("Should not be able to get statement with an inexistent statement", async () => {
    const responseToken = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@test.com.br",
      password: "123456"
    });

    const { token }= responseToken.body

    await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      description: "Deposit test",
      amount: 50
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    const  id  = "INCORRECT_STATEMENT"

    const response = await request(app)
    .get(`/api/v1/statements/${id}`)
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(500);
  });
});
