import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Models } from '@/schema/Models';
import { User } from '@/schema/database/User';
import { Model } from 'mongoose';
import { ApiResponse, AuthMessages, CreateApiResponse } from '@/schema/dto/Api';
import * as argon2 from 'argon2';
import * as moment from 'moment';
import { randomUUID } from 'crypto';
import { Settings } from '@/main';
import { JwtService } from '@nestjs/jwt';
import { CommonArgonConfiguration } from '@/util/Crypto';
import { UserToken } from '@/schema/dto/User';
import { usernameToId } from '@/util/Common';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Models.User) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  public async register(
    username: string,
    password: string,
  ): Promise<ApiResponse> {
    // Check if the server accepts registration
    if (Settings.auth?.allowRegistration === false) {
      return {
        status: 'FAIL',
        message: AuthMessages.RegistrationDisabled,
      };
    }

    // Check if the username is taken
    if (await this.userModel.exists({ username })) {
      return {
        status: 'FAIL',
        message: AuthMessages.UsernameTaken,
      };
    }

    // Hash the user's password
    const hashedPassword = await argon2.hash(
      password,
      CommonArgonConfiguration,
    );

    // Create a new user
    const user = new this.userModel({
      username,
      password: hashedPassword,
      registerDate: moment().toISOString(),
      loginDate: moment().toISOString(),
      lastSeen: moment().toISOString(),
      devices: [],
    });

    // Save the user to the database
    await user.save();

    return CreateApiResponse({
      status: 'OK',
    });
  }

  public async login(
    username: string,
    password: string,
    deviceId?: string,
  ): Promise<ApiResponse<{ accessToken: string; deviceId?: string }>> {
    // Check if the user exists
    const user = await this.userModel.findOne({ username });
    if (!user) {
      return {
        status: 'FAIL',
        message: AuthMessages.UserNotFound,
      };
    }

    // Check if the hashed password matches the one here
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return {
        status: 'FAIL',
        message: AuthMessages.PasswordIncorrect,
      };
    }

    // Check if the device exists
    if (
      !deviceId ||
      (deviceId && !user.devices.some((d) => d.deviceId === deviceId))
    ) {
      // We need to create one ourselves
      deviceId = randomUUID();
      user.devices.push({ deviceId, deprecated: [] });
      await user.save();
    }

    const payload = {
      sub: user._id,
      username: user.username,
      device: deviceId,
    };

    return CreateApiResponse({
      status: 'OK',
      data: {
        accessToken: this.jwtService.sign(payload),
        deviceId,
      },
    });
  }

  public async getSelf(user: UserToken) {
    const u = await this.userModel.findOne({ _id: user._id });
    return CreateApiResponse({
      status: 'OK',
      data: {
        username: usernameToId(u.username),
      },
    });
  }
}
