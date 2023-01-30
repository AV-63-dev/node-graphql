import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';
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
    async function (request, reply): Promise<PostEntity | HttpError> {
      const {title, content, userId} = request.body;
      if (title && content && userId) {
        return await fastify.db.posts.create(request.body);
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
    async function (request, reply): Promise<PostEntity | HttpError> {
      const id = request.params.id;
      const post = await fastify.db.posts.findOne({ key: 'id', equals: id });
      return post ? await fastify.db.posts.delete(id) : fastify.httpErrors.badRequest('Post not found');
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
      const post = await fastify.db.posts.findOne({ key: 'id', equals: id });
      return post ? await fastify.db.posts.change(id, request.body) : fastify.httpErrors.badRequest('Post not found');
    }
  );
};

export default plugin;
