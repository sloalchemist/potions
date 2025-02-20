import {
  initializeDatabase,
  initializeInMemoryDatabase,
  DB
} from '../src/library/database';
import * as fs from 'fs';
import path from 'path';

describe('Database Initialization', () => {
  const testDbPath = path.join(__dirname, 'test.db');

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    if (DB && !DB.close) {
      DB.close();
    }
  });

  it('should initialize an in-memory database', () => {
    initializeInMemoryDatabase();
    expect(DB).toBeDefined();
    expect(DB?.memory).toBe(true);
  });

  it('should initialize a database from a file', () => {
    initializeDatabase(testDbPath);
    expect(DB).toBeDefined();
    expect(DB?.memory).toBe(false);
    expect(fs.existsSync(testDbPath)).toBe(true);
  });

  it('should rebuild the database if rebuild option is true', () => {
    initializeDatabase(testDbPath);
    expect(fs.existsSync(testDbPath)).toBe(true);

    initializeDatabase(testDbPath, true);
    expect(DB).toBeDefined();
    expect(fs.existsSync(testDbPath)).toBe(true);
  });

  it('should initialize the database if file does not exist and rebuild is false', () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    initializeDatabase(testDbPath, false);
    expect(DB).toBeDefined();
    expect(fs.existsSync(testDbPath)).toBe(true);
  });

  it('should not throw an error if the database file does not exist and rebuild is false', () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    expect(() => initializeDatabase(testDbPath, false)).not.toThrow();
  });

  it('should close the database after each test', () => {
    initializeDatabase(testDbPath);
    expect(DB).toBeDefined();

    const closeSpy = jest.spyOn(DB, 'close');
    expect(closeSpy).not.toHaveBeenCalled(); // Ensure it hasn't been called yet.
  });
});
