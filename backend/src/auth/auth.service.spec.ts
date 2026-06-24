import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

// Mock the entire bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signin', () => {
    it('should throw UnauthorizedException if user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.signin('nonexistent@test.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = { _id: '1', email: 'test@test.com', password: 'hashed' };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.signin('test@test.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return an access_token if credentials are valid', async () => {
      const mockUser = { _id: '1', email: 'test@test.com', password: 'hashed' };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.signin(
        'test@test.com',
        'correctpassword',
      );

      expect(result).toEqual({ access_token: 'mock-jwt-token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@test.com',
      });
    });
  });

  describe('signup', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        _id: '1',
        email: 'test@test.com',
      });

      await expect(
        authService.signup('test@test.com', 'password', 'Test User'),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a user and return a token if email is new', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        _id: '2',
        email: 'new@test.com',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await authService.signup(
        'new@test.com',
        'password',
        'New User',
      );

      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'hashed-password',
        name: 'New User',
      });
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
    });
  });
});
