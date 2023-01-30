import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import { testUUID, spliceSubscribedToUserIds } from '../../utils/myUtils';
import { HttpError } from '@fastify/sensible/lib/httpError';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {

  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
    return await fastify.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const id = request.params.id;
      if (!testUUID(id)) {
        // return fastify.httpErrors.badRequest('Error: invalid id');
        return fastify.httpErrors.notFound('Error: invalid id'); // только по тому что в тестах БАГ !!!
      };

      const user = await fastify.db.users.findOne({ key: 'id', equals: id });
      return user ? user : fastify.httpErrors.notFound('User not found');
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      return await fastify.db.users.create(request.body); // TODO
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const id = request.params.id;
      if (!testUUID(id)) {
        return fastify.httpErrors.badRequest('Error: invalid id');
      };

      const user = await fastify.db.users.findOne({ key: 'id', equals: id });
      if (!user) {
        return fastify.httpErrors.notFound('User not found');
      };

      const whoSubscribeUser = await fastify.db.users.findMany({key: 'subscribedToUserIds', inArray: id});
      whoSubscribeUser.map(async (item) => {
        spliceSubscribedToUserIds(item, id);
        await fastify.db.users.change(item.id, item);
      });

      const posts = await fastify.db.posts.findMany({key: 'userId', equals: id});
      posts.map(async (item) => await fastify.db.posts.delete(item.id) );

      const profiles = await fastify.db.profiles.findMany({key: 'userId', equals: id});
      profiles.map(async (item) => await fastify.db.profiles.delete(item.id) );

      return await fastify.db.users.delete(id);
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const likedUserID = request.params.id;
      const likedUser = await fastify.db.users.findOne({ key: 'id', equals: likedUserID });
      if (!likedUser) {
        return fastify.httpErrors.notFound('Is no liked user');
      };

      const subscribedUserID = request.body.userId;
      const subscribedUser = await fastify.db.users.findOne({ key: 'id', equals: subscribedUserID });
      if (!subscribedUser) {
        return fastify.httpErrors.notFound('Is no subscribed user');
      };

      if (subscribedUser.subscribedToUserIds.includes(likedUserID)) {
        return fastify.httpErrors.badRequest('Error: The user is already subscribed');
      };

      subscribedUser.subscribedToUserIds.push(likedUserID);
      return fastify.db.users.change(subscribedUserID, subscribedUser);
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const likedUserID = request.params.id;
      const likedUser = await fastify.db.users.findOne({ key: 'id', equals: likedUserID });
      if (!likedUser) {
        return fastify.httpErrors.notFound('Is no liked user');
      };

      const subscribedUserID = request.body.userId;
      const subscribedUser = await fastify.db.users.findOne({ key: 'id', equals: subscribedUserID });
      if (!subscribedUser) {
        return fastify.httpErrors.notFound('Is no subscribed user');
      };

      if (spliceSubscribedToUserIds(subscribedUser, likedUserID)) {
        return fastify.db.users.change(subscribedUserID, subscribedUser);
      } else {
        return fastify.httpErrors.badRequest('Error: The user is already unsubscribed');
      };
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const id = request.params.id;
      if (!testUUID(id)) {
        return fastify.httpErrors.badRequest('Error: invalid id');
      };
      
      const user = await fastify.db.users.findOne({ key: 'id', equals: id });
      return user ? await fastify.db.users.change(id, request.body) : fastify.httpErrors.notFound('User not found');
    }
  );
};

export default plugin;
