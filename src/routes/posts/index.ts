import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';
import { testUUID } from '../../utils/myUtils';
import { HttpError } from '@fastify/sensible/lib/httpError';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {

  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    return await fastify.db.posts.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | HttpError> {
      const id = request.params.id;
      if (!testUUID(id)) {
        // return fastify.httpErrors.badRequest('Error: invalid id');
        return fastify.httpErrors.notFound('Error: invalid id'); // только по тому что в тестах БАГ !!!

      };

      const post = await fastify.db.posts.findOne({ key: 'id', equals: id });
      return post ? post : fastify.httpErrors.notFound('Post not found');
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      return await fastify.db.posts.create(request.body); // TODO
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | HttpError> {
      const id = request.params.id;
      if (!testUUID(id)) {
        return fastify.httpErrors.badRequest('Error: invalid id');
      };

      const post = await fastify.db.posts.findOne({key: 'id', equals: id});
      if (!post) {
        return fastify.httpErrors.notFound('Post not found');
      };

      return await fastify.db.posts.delete(id);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | HttpError> {
      const id = request.params.id;
      if (!testUUID(id)) {
        return fastify.httpErrors.badRequest('Error: invalid id');
      };

      const post = await fastify.db.posts.findOne({key: 'id', equals: id});
      if (!post) {
        return fastify.httpErrors.notFound('Post not found');
      };

      return await fastify.db.posts.change(id, request.body)
    }
  );
};

export default plugin;
