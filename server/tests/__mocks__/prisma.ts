const mockUserFindUnique = jest.fn();
const mockUserFindFirst = jest.fn();
const mockUserUpsert = jest.fn();
const mockUserUpdateMany = jest.fn();
const mockSearchCreate = jest.fn();

const prismaMock = {
  user: {
    findUnique: mockUserFindUnique,
    findFirst: mockUserFindFirst,
    upsert: mockUserUpsert,
    updateMany: mockUserUpdateMany,
  },
  search: {
    create: mockSearchCreate,
  },
  $queryRaw: jest.fn(),
};

export default prismaMock;
export { mockUserFindUnique, mockUserFindFirst, mockUserUpsert, mockUserUpdateMany, mockSearchCreate };
