const { getTasks, createTask } = require('../src/handler');
const AWS = require('aws-sdk');

jest.mock('aws-sdk', () => {
  const mScan = jest.fn();
  const mPut = jest.fn();
  const mDocumentClient = {
    scan: jest.fn(() => ({ promise: () => mScan() })),
    put: jest.fn(() => ({ promise: () => mPut() })),
  };
  return {
    DynamoDB: { DocumentClient: jest.fn(() => mDocumentClient) },
    __mocks__: { mScan, mPut, mDocumentClient }
  };
});

const { __mocks__: { mScan, mPut } } = AWS;

afterEach(() => {
  jest.clearAllMocks();
});

describe('getTasks', () => {
  it('returns tasks from DynamoDB', async () => {
    const items = [{ id: '1', title: 'task' }];
    mScan.mockResolvedValue({ Items: items });
    const result = await getTasks();
    expect(result).toEqual({ statusCode: 200, body: JSON.stringify(items) });
  });
});

describe('createTask', () => {
  it('stores task and returns new item', async () => {
    mPut.mockResolvedValue({});
    const event = { body: JSON.stringify({ title: 'new' }) };
    const result = await createTask(event);
    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.title).toBe('new');
    expect(body).toHaveProperty('id');
  });

  it('returns 400 for invalid body', async () => {
    const res1 = await createTask({ body: JSON.stringify({}) });
    expect(res1.statusCode).toBe(400);

    const res2 = await createTask({ body: JSON.stringify({ title: 123 }) });
    expect(res2.statusCode).toBe(400);
  });
});
