import { User } from '../models/User';

export interface UserDao {
  getUserByPhone(phone: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  insertUser(user: User): Promise<void>;
  updateUser(user: User): Promise<void>;
  deleteUser(id: string): Promise<void>;
}
