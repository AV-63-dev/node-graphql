import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';
import { HttpError } from '@fastify/sensible/lib/httpError';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<MemberTypeEntity[]> {
    return await fastify.db.memberTypes.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity | HttpError> {
      const id = request.params.id;
      const memberType = await fastify.db.memberTypes.findOne({key: 'id', equals: id});
      return memberType ? memberType : fastify.httpErrors.notFound('MemberType not found');
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity  | HttpError> {
      const id = request.params.id;
      const memberType = await fastify.db.memberTypes.findOne({key: 'id', equals: id});
      if (!memberType) {
        return fastify.httpErrors.badRequest('MemberType not found');
      };
      return await fastify.db.memberTypes.change(id, request.body);
    }
  );
};

export default plugin;
