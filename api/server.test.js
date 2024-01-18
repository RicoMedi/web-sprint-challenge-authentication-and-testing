const db = require("../data/dbConfig");
const request = require("supertest");
const server = require("./server");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db("users").truncate();
});

describe("[POST] /auth/register", () => {
  const newUser = { username: "Cat", password: "Dogsaregross" };
  it("new users are listed in the db", async () => {
    await request(server).post("/api/auth/register").send(newUser);
    const rows = await db("users");
    expect(rows).toHaveLength(1);
  });
  it("returns username", async () => {
    const res = await request(server).post("/api/auth/register").send(newUser);
    expect(res.body.username).toMatch(newUser.username);
    expect(res.body.password).not.toMatch(newUser.password);
  });
});

describe("[POST] /auth/login", () => {
  const newUser = { username: "dogs", password: "catssuck" };
  it("new user sends back a token", async () => {
    await request(server).post("/api/auth/register").send(newUser);
    const res = await request(server).post("/api/auth/login").send(newUser);
    expect(res.body.token).toBeDefined();
  });
  it("incorrect password sends error message back", async () => {
    await request(server).post("/api/auth/register").send(newUser);
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: newUser.username, password: "1" });
    expect(res.body.message).toBe("invalid credentials");
  });
});
describe("[GET] /jokes while authenticated", () => {
  const newUser = { username: "cows", password: "arecute" };
  it("receives an error with no token present", async () => {
    await request(server).post("/api/auth/register").send(newUser);
    await request(server).post("/api/auth/login").send(newUser);
    const data = await request(server).get("/api/jokes");
    expect(data.body.message).toBe("token required");
  });
  it("returns a list of jokes while authorized", async () => {
    await request(server).post("/api/auth/register").send(newUser);
    const res = await request(server).post("/api/auth/login").send(newUser);
    const data = await request(server)
      .get("/api/jokes")
      .set("Authorization", `${res.body.token}`);
    expect(data.body).toHaveLength(3);
  });
});
