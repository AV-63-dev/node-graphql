import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { testUUID } from '../../utils/myUtils';
import { HttpError } from '@fastify/sensible/lib/httpError';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {

  fastify.get('/', async function (request, reply): Promise<ProfileEntity[]> {
    return await fastify.db.profiles.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | HttpError> {
      const id = request.params.id;
      const profile = await fastify.db.profiles.findOne({key: 'id', equals: id});
      return profile ? profile : fastify.httpErrors.notFound('Profile not found');
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | HttpError> {
      const {avatar, sex, birthday, country, street, city, userId, memberTypeId} = request.body;
      if (avatar && sex && birthday && country && street && city && userId && testUUID(userId) && memberTypeId) {
        const user = await fastify.db.users.findOne({ key: 'id', equals: userId });
        if (!user) {
          return fastify.httpErrors.badRequest('User not found');
        };

        const profile = await fastify.db.profiles.findOne({key: 'userId', equals: userId});
        if (profile) {
          return fastify.httpErrors.badRequest('Profile found');
        };

        const memberType = await fastify.db.memberTypes.findOne({key: 'id', equals: memberTypeId});
        if (!memberType) {
          return fastify.httpErrors.badRequest('MemberType not found');
        };

        return await fastify.db.profiles.create(request.body);
      } else {
        return fastify.httpErrors.badRequest('Error: body is not filled required properties');
      };
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | HttpError> {
      const id = request.params.id;
      const profile = await fastify.db.profiles.findOne({key: 'id', equals: id});
      return profile ? await fastify.db.profiles.delete(id) : fastify.httpErrors.badRequest('Profile not found');
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity | HttpError> {
      const id = request.params.id;
      const profile = await fastify.db.profiles.findOne({key: 'id', equals: id});
      return profile ? await fastify.db.profiles.change(id, request.body) : fastify.httpErrors.badRequest('Profile not found');
    }
  );
};

export default plugin;
