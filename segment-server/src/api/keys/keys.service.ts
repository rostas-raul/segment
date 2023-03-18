import { User } from '@/schema/database/User';
import { UserToken } from '@/schema/dto/User';
import { Models } from '@/schema/Models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UploadKeyDto } from './keys.validation';
import * as rsa from 'node-rsa';
import { CreateApiResponse, KeyMessages } from '@/schema/dto/Api';
import { randomUUID } from 'crypto';
import * as moment from 'moment';
import { sha256 } from '@/util/Crypto';
import { getServerPublicKey } from '@/util/Key';

@Injectable()
export class KeysService {
  constructor(
    @InjectModel(Models.User) private readonly userModel: Model<User>,
  ) {}

  public async getServerKeys() {
    return CreateApiResponse(
      {
        status: 'OK',
        data: {
          publicKey: getServerPublicKey(),
        },
      },
      'server',
    );
  }

  public async getKeys(user: UserToken) {
    const savedUser = await this.userModel.findOne({ _id: user._id });
    return CreateApiResponse({
      status: 'OK',
      data: savedUser.devices.map((x) => x.publicKey).filter((x) => !!x),
    });
  }

  public async uploadKey(uploadKey: UploadKeyDto, user: UserToken) {
    const savedUser = await this.userModel.findOne({ _id: user._id });
    const userDeviceIndex = savedUser.devices.findIndex(
      (d) => d.deviceId === user.deviceId,
    );

    // check if the signature is valid
    const sig = uploadKey.signature;
    const key = new rsa({ b: 1024 }).importKey(uploadKey.publicKey, 'public');

    if (!key.verify(sha256(uploadKey.publicKey), Buffer.from(sig, 'base64'))) {
      return CreateApiResponse({
        status: 'FAIL',
        message: KeyMessages.InvalidSignature,
      });
    }

    // check if the key is already defined; if so, deprecate it
    if (savedUser.devices[userDeviceIndex].publicKey !== null) {
      await this.deprecateKey(
        savedUser.devices[userDeviceIndex].publicKey.id,
        user,
      );
    }

    // save it to the database
    const randomId = randomUUID();
    savedUser.devices[userDeviceIndex].publicKey.id = randomId;
    savedUser.devices[userDeviceIndex].publicKey.content = uploadKey.publicKey;
    savedUser.markModified('devices');
    await savedUser.updateOne({
      $set: {
        devices: savedUser.devices,
      },
    });

    return CreateApiResponse({
      status: 'OK',
      data: {
        keyId: randomId,
      },
    });
  }

  public async deprecateKey(keyId: string, user: UserToken) {
    const savedUser = await this.userModel.findOne({ _id: user._id });
    const userDeviceIndex = savedUser.devices.findIndex(
      (d) => d.publicKey.id === keyId,
    );

    // move it to the deprecated array
    const copy = savedUser.devices[userDeviceIndex].publicKey;
    savedUser.devices[userDeviceIndex].publicKey = null;

    savedUser.devices[userDeviceIndex].deprecated.push({
      publicKey: copy.content,
      deprecatedAt: moment().toISOString(),
    });

    savedUser.markModified('devices');
    await savedUser.updateOne({
      $set: {
        devices: savedUser.devices,
      },
    });

    return CreateApiResponse({
      status: 'OK',
    });
  }

  public async getUserKeys(
    userId: string,
    deprecated = false,
    timestamp: string | null = null,
  ) {
    const savedUser = await this.userModel.findOne({
      username: userId.split('@')[0],
    });

    if (!savedUser) {
      return CreateApiResponse({
        status: 'OK',
        message: KeyMessages.UserNotFound,
      });
    }

    const publicKeyData = savedUser.devices
      .map((device) => ({
        publicKey: device.publicKey,
        deprecated:
          deprecated && device.deprecated.length
            ? device.deprecated.filter(
                (key) =>
                  !timestamp ||
                  new Date(key.deprecatedAt).valueOf() <=
                    new Date(timestamp).valueOf(),
              )
            : null,
      }))
      .filter(
        (device) =>
          device.publicKey || (device.deprecated && device.deprecated.length),
      );

    return CreateApiResponse(
      {
        status: 'OK',
        data: publicKeyData,
      },
      'server',
    );
  }
}
