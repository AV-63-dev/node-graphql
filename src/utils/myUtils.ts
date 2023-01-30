import type { UserEntity } from './DB/entities/DBUsers';

export const testUUID = (uuid: string): boolean => (new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$')).test(uuid);

export const spliceSubscribedToUserIds = (subscribedUser: UserEntity, likedUserID: string): boolean => {
    const index = subscribedUser.subscribedToUserIds.indexOf(likedUserID);
      if (index === -1) {
        return false
      };
      subscribedUser.subscribedToUserIds.splice(index,1);
      return true;
};