import type { UserEntity } from './DB/entities/DBUsers';

export const testUUID = (uuid: string): boolean => (new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)).test(uuid);

export const spliceSubscribedToUserIds = (subscribedUser: UserEntity, likedUserID: string): boolean => {
    const index = subscribedUser.subscribedToUserIds.indexOf(likedUserID);
      if (index === -1) {
        return false
      };
      subscribedUser.subscribedToUserIds.splice(index,1);
      return true;
};